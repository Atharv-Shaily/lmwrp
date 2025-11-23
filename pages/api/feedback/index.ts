import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { productId, orderId, status } = req.query;

      const query: any = {};
      if (productId) query.product = productId;
      if (orderId) query.order = orderId;
      if (status) query.status = status;

      const feedbacks = await Feedback.find(query)
        .populate('user', 'name')
        .populate('product', 'name images')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 });

      res.status(200).json(feedbacks);
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId, orderId, type, rating, comment, images } = req.body;

      if (!type || !rating || !comment) {
        return res.status(400).json({ message: 'Type, rating, and comment are required' });
      }

      const feedback = await Feedback.create({
        user: (session.user as any).id,
        product: productId,
        order: orderId,
        type,
        rating,
        comment,
        images,
        status: 'pending',
      });

      await feedback.populate([
        { path: 'user', select: 'name' },
        { path: 'product', select: 'name images' },
      ]);

      res.status(201).json(feedback);
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






