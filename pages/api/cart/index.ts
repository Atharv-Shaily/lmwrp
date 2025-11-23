import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
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

  if (req.method === 'GET') {
    try {
      let cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }
      res.status(200).json(cart);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      if (product.minOrderQuantity && quantity < product.minOrderQuantity) {
        return res.status(400).json({
          message: `Minimum order quantity for this product is ${product.minOrderQuantity}`
        });
      }

      // Prevent users from ordering their own products
      if (product.seller.toString() === userId) {
        return res.status(400).json({ message: 'You cannot order your own product' });
      }

      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
      await cart.populate('items.product');

      res.status(200).json(cart);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { items } = req.body;

      // Validate items against MOQ
      for (const item of items) {
        const product = await Product.findById(item.product._id || item.product);
        if (product && product.minOrderQuantity && item.quantity < product.minOrderQuantity) {
          return res.status(400).json({
            message: `Minimum order quantity for ${product.name} is ${product.minOrderQuantity}`
          });
        }
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }

      cart.items = items;
      await cart.save();
      await cart.populate('items.product');

      res.status(200).json(cart);
    } catch (error: any) {
      console.error('Error updating cart:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






