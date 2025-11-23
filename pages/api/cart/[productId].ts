import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
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
  const { productId } = req.query;

  if (req.method === 'DELETE') {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      cart.items = cart.items.filter(
        (item: any) => item.product.toString() !== productId
      );
      await cart.save();
      await cart.populate('items.product');

      res.status(200).json(cart);
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






