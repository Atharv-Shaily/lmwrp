import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await connectDB();

    try {
        // Update DhruvShop (Shamirpet)
        await User.updateOne(
            { businessName: { $regex: 'DhruvShop', $options: 'i' } },
            {
                $set: {
                    'location.coordinates.lat': 17.5686,
                    'location.coordinates.lng': 78.5639,
                    'location.address': 'Shamirpet', // Setting address to City for display if empty
                }
            }
        );

        // Update ReshmaShop (Uddemarri)
        await User.updateOne(
            { businessName: { $regex: 'ReshmaShop', $options: 'i' } },
            {
                $set: {
                    'location.coordinates.lat': 17.5900,
                    'location.coordinates.lng': 78.5900,
                    'location.address': 'Uddemarri',
                }
            }
        );

        res.status(200).json({ message: 'Shops updated' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
