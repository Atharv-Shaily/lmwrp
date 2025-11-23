import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { calculateDistance } from '@/lib/location';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      lat,
      lng,
      maxDistance, // in km
      page = '1',
      limit = '20',
    } = req.query;

    const query: any = { status: 'active' };

    if (search) {
      query.$text = { $search: search as string };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    let products = await Product.find(query)
      .populate('seller', 'name businessName location')
      .populate('proxySource', 'name businessName location');

    // Filter by distance if location provided
    if (lat && lng && maxDistance) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxDist = parseFloat(maxDistance as string);

      products = products.filter((product: any) => {
        const seller = product.seller;
        if (seller?.location?.coordinates?.lat && seller?.location?.coordinates?.lng) {
          const distance = calculateDistance(
            userLat,
            userLng,
            seller.location.coordinates.lat,
            seller.location.coordinates.lng
          );
          return distance <= maxDist;
        }
        return false;
      });
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limitNum);

    res.status(200).json({
      products: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}






