import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import bcrypt from 'bcryptjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDB();

        // 1. Create Users (Shops)
        const password = await bcrypt.hash('password123', 10);

        const shops = [
            {
                name: 'Tech World',
                email: 'tech@example.com',
                role: 'retailer',
                businessName: 'Tech World Electronics',
                location: {
                    address: '123 Tech Park',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    coordinates: { lat: 12.9716, lng: 77.5946 }
                }
            },
            {
                name: 'Fresh Farms',
                email: 'fresh@example.com',
                role: 'wholesaler',
                businessName: 'Fresh Farms Wholesale',
                location: {
                    address: '456 Green Valley',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    coordinates: { lat: 19.0760, lng: 72.8777 }
                }
            },
            {
                name: 'Daily Needs',
                email: 'daily@example.com',
                role: 'retailer',
                businessName: 'Daily Needs Supermarket',
                location: {
                    address: '789 Market St',
                    city: 'Delhi',
                    state: 'Delhi',
                    coordinates: { lat: 28.7041, lng: 77.1025 }
                }
            },
            {
                name: 'Gadget Hub',
                email: 'gadget@example.com',
                role: 'wholesaler',
                businessName: 'Gadget Hub Imports',
                location: {
                    address: '101 Silicon Way',
                    city: 'Hyderabad',
                    state: 'Telangana',
                    coordinates: { lat: 17.3850, lng: 78.4867 }
                }
            }
        ];

        const createdShops = [];
        for (const shop of shops) {
            const existing = await User.findOne({ email: shop.email });
            if (existing) {
                createdShops.push(existing);
            } else {
                const newUser = await User.create({
                    ...shop,
                    password,
                    isVerified: true
                });
                createdShops.push(newUser);
            }
        }

        // 2. Create Products
        const products = [
            // Electronics (Tech World & Gadget Hub)
            {
                name: 'Smartphone X Pro',
                description: 'Latest flagship smartphone with 108MP camera and 5G support.',
                price: 69999,
                category: 'Electronics',
                images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff70?auto=format&fit=crop&w=800&q=80'],
                stock: 50,
                seller: createdShops[0]._id, // Tech World
                sellerType: 'retailer'
            },
            {
                name: 'Wireless Noise Cancelling Headphones',
                description: 'Premium over-ear headphones with 30-hour battery life.',
                price: 14999,
                category: 'Electronics',
                images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
                stock: 100,
                seller: createdShops[3]._id, // Gadget Hub
                sellerType: 'wholesaler'
            },
            {
                name: '4K Smart LED TV 55"',
                description: 'Ultra HD Smart TV with HDR10+ and Dolby Atmos.',
                price: 45000,
                category: 'Electronics',
                images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80'],
                stock: 20,
                seller: createdShops[0]._id, // Tech World
                sellerType: 'retailer'
            },

            // Groceries & Fruits (Fresh Farms & Daily Needs)
            {
                name: 'Organic Avocados (Pack of 4)',
                description: 'Fresh, creamy organic avocados sourced directly from farms.',
                price: 599,
                category: 'Fruits',
                images: ['https://images.unsplash.com/photo-1523049673856-6468baca292f?auto=format&fit=crop&w=800&q=80'],
                stock: 200,
                seller: createdShops[1]._id, // Fresh Farms
                sellerType: 'wholesaler'
            },
            {
                name: 'Premium Basmati Rice (5kg)',
                description: 'Extra long grain aromatic basmati rice.',
                price: 850,
                category: 'Groceries',
                images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
                stock: 500,
                seller: createdShops[2]._id, // Daily Needs
                sellerType: 'retailer'
            },
            {
                name: 'Fresh Strawberries (500g)',
                description: 'Sweet and juicy strawberries, hand-picked.',
                price: 299,
                category: 'Fruits',
                images: ['https://images.unsplash.com/photo-1464965911861-746a04b4b0a9?auto=format&fit=crop&w=800&q=80'],
                stock: 100,
                seller: createdShops[1]._id, // Fresh Farms
                sellerType: 'wholesaler'
            },

            // Dairy & Packaged Food
            {
                name: 'Farm Fresh Milk (1L)',
                description: 'Pasteurized whole milk, rich in calcium.',
                price: 65,
                category: 'Dairy',
                images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80'],
                stock: 50,
                seller: createdShops[2]._id, // Daily Needs
                sellerType: 'retailer'
            },
            {
                name: 'Assorted Cookies Box',
                description: 'Premium butter cookies with chocolate chips and nuts.',
                price: 350,
                category: 'Packaged Food',
                images: ['https://images.unsplash.com/photo-1499636138143-bd630f5cf38b?auto=format&fit=crop&w=800&q=80'],
                stock: 150,
                seller: createdShops[2]._id, // Daily Needs
                sellerType: 'retailer'
            }
        ];

        let createdCount = 0;
        for (const p of products) {
            const existing = await Product.findOne({ name: p.name, seller: p.seller });
            if (!existing) {
                await Product.create(p);
                createdCount++;
            }
        }

        res.status(200).json({
            message: 'Database seeded successfully',
            shops: createdShops.length,
            productsCreated: createdCount
        });
    } catch (error: any) {
        console.error('Seeding error:', error);
        res.status(500).json({ message: error.message });
    }
}
