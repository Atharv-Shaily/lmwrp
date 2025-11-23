import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id)
        .populate('seller', 'name businessName location')
        .populate('proxySource', 'name businessName location');

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json(product);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const userId = (session.user as any).id;
      if (product.seller.toString() !== userId) {
        return res.status(403).json({ message: 'You can only update your own products' });
      }

      const updateData: any = { ...req.body };

      // Normalize proxySource: avoid casting empty string to ObjectId
      if (!updateData.isProxy || !updateData.proxySource) {
        updateData.isProxy = !!updateData.isProxy;
        updateData.proxySource = undefined;
      }

      Object.assign(product, updateData);
      await product.save();
      await product.populate('seller', 'name businessName');

      res.status(200).json(product);
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const userId = (session.user as any).id;
      if (product.seller.toString() !== userId) {
        return res.status(403).json({ message: 'You can only delete your own products' });
      }

      await Product.findByIdAndDelete(id);

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






