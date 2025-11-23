import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
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

    if (req.method === 'DELETE') {
        try {
            // 1. Delete User
            await User.findByIdAndDelete(userId);

            // 2. Delete Cart
            await Cart.findOneAndDelete({ user: userId });

            // 3. Optional: Handle Orders (Keep them for records, or anonymize?)
            // For now, we keep orders but maybe mark customer as deleted?
            // Mongoose doesn't enforce referential integrity so orders will just have a missing customer.

            // 4. If user is a seller, what happens to their products?
            // We should probably deactivate them or delete them.
            // Let's delete them for now to clean up.
            await Product.deleteMany({ seller: userId });

            res.status(200).json({ message: 'Account deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting account:', error);
            res.status(500).json({ message: error.message || 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
