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

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = (session.user as any).id;
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const query = await Query.findById(id)
        .populate('user', 'name email')
        .populate('order', 'orderNumber')
        .populate('product', 'name')
        .populate('responses.user', 'name role');

      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      res.status(200).json(query);
    } catch (error: any) {
      console.error('Error fetching query:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const query = await Query.findById(id);
      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      const { message, status } = req.body;

      // Add response
      if (message) {
        query.responses.push({
          user: userId,
          message,
          createdAt: new Date(),
        });
        if (query.status === 'open') {
          query.status = 'in_progress';
        }
      }

      // Update status
      if (status) {
        query.status = status;
      }

      await query.save();
      await query.populate([
        { path: 'user', select: 'name email' },
        { path: 'order', select: 'orderNumber' },
        { path: 'product', select: 'name' },
        { path: 'responses.user', select: 'name role' },
      ]);

      res.status(200).json(query);
    } catch (error: any) {
      console.error('Error updating query:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






