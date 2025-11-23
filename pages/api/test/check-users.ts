import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await connectDB();

    try {
        const users = await User.find({
            $or: [
                { name: { $regex: 'dhruv', $options: 'i' } },
                { name: { $regex: 'reshma', $options: 'i' } },
                { businessName: { $regex: 'dhruv', $options: 'i' } },
                { businessName: { $regex: 'reshma', $options: 'i' } }
            ]
        });

        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
