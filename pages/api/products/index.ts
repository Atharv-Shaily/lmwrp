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

  if (req.method === 'GET') {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        inStock,
        seller,
        sellerType,
        page = '1',
        limit = '20',
        sort = 'createdAt',
        order = 'desc',
        lat,
        lng,
        radius,
      } = req.query;

      const query: any = { status: 'active' };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$text = { $search: search as string };
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
      }

      if (inStock === 'true') {
        query.stock = { $gt: 0 };
      }

      if (seller) {
        query.seller = seller;
      }

      if (sellerType) {
        query.sellerType = sellerType;
      }

      // If location filtering is requested, we need to fetch all potential matches first
      // then filter in memory because location is on the 'seller' reference
      if (lat && lng && radius) {
        // Fetch all active products with seller populated
        const allProducts = await Product.find(query)
          .populate('seller', 'name businessName location')
          .populate('proxySource', 'name businessName');

        const radiusKm = parseFloat(radius as string);
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);

        const filteredProducts = allProducts.filter((product: any) => {
          if (!product.seller?.location?.coordinates) return false;

          const { lat: sLat, lng: sLng } = product.seller.location.coordinates;
          if (!sLat || !sLng) return false;

          const distance = getDistanceFromLatLonInKm(userLat, userLng, sLat, sLng);
          return distance <= radiusKm;
        });

        // Pagination for filtered results
        const total = filteredProducts.length;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        return res.status(200).json({
          products: paginatedProducts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        });
      }

      // Normal execution if no location filter
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const sortObj: any = {};
      if (sort === 'price') {
        sortObj.price = order === 'asc' ? 1 : -1;
      } else if (sort === 'name') {
        sortObj.name = order === 'asc' ? 1 : -1;
      } else {
        sortObj.createdAt = order === 'asc' ? 1 : -1;
      }

      const products = await Product.find(query)
        .populate('seller', 'name businessName location')
        .populate('proxySource', 'name businessName')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);

      const total = await Product.countDocuments(query);

      res.status(200).json({
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userRole = (session.user as any).role;
      if (userRole !== 'retailer' && userRole !== 'wholesaler') {
        return res.status(403).json({ message: 'Only retailers and wholesalers can create products' });
      }

      const productData = {
        ...req.body,
        seller: (session.user as any).id,
        sellerType: userRole,
      };

      const product = await Product.create(productData);
      await product.populate('seller', 'name businessName');

      res.status(201).json(product);
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}






