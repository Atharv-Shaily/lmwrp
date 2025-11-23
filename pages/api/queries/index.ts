import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Query from '@/models/Query';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = (session.user as any).id;
      const userRole = (session.user as any).role;

      const queryObj: any = {};

      // Customers see their own queries
      // Retailers/Wholesalers see queries related to their products/orders
      if (userRole === 'customer') {
        queryObj.user = userId;
      } else {
        // For sellers, we'd need to join with orders/products
        // Simplified: show all queries for now, can be filtered by order/product
        queryObj.status = { $ne: 'closed' };
      }

      const queries = await Query.find(queryObj)
        .populate('user', 'name email')
        .populate('order', 'orderNumber')
        .populate('product', 'name')
        .sort({ createdAt: -1 });

      res.status(200).json(queries);
    } catch (error: any) {
      console.error('Error fetching queries:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { orderId, productId, subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required' });
      }

      const query = await Query.create({
        user: (session.user as any).id,
        order: orderId,
        product: productId,
        subject,
        message,
        status: 'open',
        responses: [],
      });

      await query.populate([
        { path: 'user', select: 'name email' },
        { path: 'order', select: 'orderNumber' },
        { path: 'product', select: 'name' },
      ]);

      res.status(201).json(query);
    } catch (error: any) {
      console.error('Error creating query:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






