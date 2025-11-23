import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { sendDeliveryNotificationEmail } from '@/lib/email';
import { sendDeliveryNotificationSMS } from '@/lib/sms';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const order = await Order.findById(id)
        .populate('customer', 'name email phone location')
        .populate('items.product', 'name images price seller')
        .populate('retailer', 'name businessName');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const isSellerForAnyItem = order.items.some(
        (item: any) =>
          (item.product as any)?.seller &&
          (item.product as any).seller.toString() === userId
      );

      // Check permissions
      const customerId = order.customer?._id || order.customer;
      const retailerId = order.retailer?._id || order.retailer;

      const canView =
        customerId?.toString() === userId ||
        isSellerForAnyItem ||
        (userRole === 'retailer' && retailerId?.toString() === userId) ||
        (userRole === 'wholesaler' && retailerId?.toString() === userId);

      if (!canView) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.status(200).json(order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const order = await Order.findById(id).populate('items.product', 'seller');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check permissions - only sellers can update order status
      const isSellerForAnyItem = order.items.some(
        (item: any) =>
          (item.product as any)?.seller &&
          (item.product as any).seller.toString() === userId
      );

      const canUpdate = isSellerForAnyItem;

      if (!canUpdate) {
        return res.status(403).json({ message: 'You can only update your own orders' });
      }

      const { status, trackingNumber, deliveryDate } = req.body;

      if (status) {
        order.status = status;

        // For COD/offline orders, treat delivered as successfully paid
        if (status === 'delivered' && order.paymentStatus === 'pending') {
          order.paymentStatus = 'paid';
        }
      }
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
      if (deliveryDate) {
        order.deliveryDate = new Date(deliveryDate);

        // For COD/offline orders, treat delivered as successfully paid
        if (status === 'delivered' && order.paymentStatus === 'pending') {
          order.paymentStatus = 'paid';
        }
      }

      await order.save();

      // Send delivery notification if delivered
      if (status === 'delivered') {
        const customer = await User.findById(order.customer);
        if (customer?.email) {
          await sendDeliveryNotificationEmail(
            customer.email,
            order.orderNumber,
            order.trackingNumber
          );
        }
        if (customer?.phone) {
          await sendDeliveryNotificationSMS(customer.phone, order.orderNumber);
        }
      }

      await order.populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'items.product', select: 'name images price' },
      ]);

      res.status(200).json(order);
    } catch (error: any) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






