import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID!,
  key_secret: process.env.RZP_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}`, orderId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const options = {
      amount: Math.round(amount), // client should send amount in paise already; if sending rupees, multiply by 100 before call
      currency,
      receipt,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Optionally attach razorpayOrderId to your Order document (if orderId provided)
    if (orderId) {
      await connectDB();
      const existing = await Order.findById(orderId);
      if (existing) {
        existing.paymentId = order.id; // store razorpay order id for later reference
        existing.paymentStatus = 'pending';
        await existing.save();
      }
    }

    return res.status(200).json({
      success: true,
      order,
      key: process.env.NEXT_PUBLIC_RZP_KEY_ID || process.env.RZP_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
