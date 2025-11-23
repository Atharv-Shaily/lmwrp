import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderConfirmationSMS } from '@/lib/sms';
import User from '@/models/User';

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

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

  if (req.method === 'GET') {
    try {
      const baseQuery: any = {};

      if (userRole === 'customer') {
        baseQuery.customer = userId;
      } else if (userRole === 'retailer') {
        // Retailers see orders from customers AND orders they placed with wholesalers
        baseQuery.$or = [{ customer: userId }, { retailer: userId }];
      } else if (userRole === 'wholesaler') {
        // Wholesalers see orders from retailers
        baseQuery.retailer = userId;
      }

      const populateConfig = [
        { path: 'customer', select: 'name email phone' },
        { path: 'items.product', select: 'name images price seller' },
        { path: 'retailer', select: 'name businessName' },
      ];

      let orders = await Order.find(baseQuery).populate(populateConfig).sort({ createdAt: -1 });

      // For retailers and wholesalers, also include orders that contain their products as seller
      if (userRole === 'retailer' || userRole === 'wholesaler') {
        const sellerProducts = await Product.find({ seller: userId }).select('_id');
        const sellerProductIds = sellerProducts.map((p: any) => p._id);

        if (sellerProductIds.length > 0) {
          const sellerOrders = await Order.find({
            'items.product': { $in: sellerProductIds },
          })
            .populate(populateConfig)
            .sort({ createdAt: -1 });

          const mergedMap = new Map<string, any>();
          for (const order of [...orders, ...sellerOrders]) {
            mergedMap.set(order._id.toString(), order);
          }

          orders = Array.from(mergedMap.values()).sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      }

      res.status(200).json(orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({ message: error.message || 'Internal server error', stack: error.stack });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        items,
        shippingAddress,
        paymentMethod,
        scheduledDate,
        notes,
        retailerId, // For retailer ordering from wholesaler
      } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }

      // Validate products and calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          });
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });
      }

      const tax = subtotal * 0.1; // 10% tax
      const shipping = req.body.fulfillmentMethod === 'pickup' ? 0 : 10; // Fixed shipping cost, free for pickup
      const total = subtotal + tax + shipping;

      // Create order
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        customer: retailerId || userId,
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
        fulfillmentMethod: req.body.fulfillmentMethod || 'delivery',
        shippingAddress,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        notes,
        retailer: retailerId ? userId : undefined,
      });

      // Update stock
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear cart for the user who placed the order
      if (!retailerId) {
        await Cart.findOneAndUpdate({ user: userId }, { items: [] });
      }

      // Populate order for response
      await order.populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'items.product', select: 'name images price' },
      ]);

      // Send notifications
      const user = await User.findById(retailerId || userId);
      if (user?.email) {
        await sendOrderConfirmationEmail(user.email, order.orderNumber, order);
      }
      if (user?.phone) {
        await sendOrderConfirmationSMS(user.phone, order.orderNumber);
      }

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}






