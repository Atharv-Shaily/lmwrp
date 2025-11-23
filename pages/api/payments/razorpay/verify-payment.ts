import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RZP_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const verified = generated_signature === razorpay_signature;

    // update order in DB if orderId is provided
    if (orderId) {
      await connectDB();
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentId = razorpay_payment_id;
        order.paymentStatus = verified ? 'paid' : 'failed';
        await order.save();
      }
    }

    return res.status(200).json({ verified });
  } catch (error: any) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
