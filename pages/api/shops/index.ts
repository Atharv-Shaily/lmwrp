import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const { lat, lng, radius } = req.query;

            // Find all retailers and wholesalers
            const query: any = {
                role: { $in: ['retailer', 'wholesaler'] },
            };

            const shops = await User.find(query).select('-password -otp -otpExpiry');

            let results = shops.map((shop: any) => {
                const shopObj = shop.toObject();
                // Add default distance if no location provided
                shopObj.distance = null;

                if (lat && lng && shop.location?.coordinates?.lat && shop.location?.coordinates?.lng) {
                    const distance = getDistanceFromLatLonInKm(
                        parseFloat(lat as string),
                        parseFloat(lng as string),
                        shop.location.coordinates.lat,
                        shop.location.coordinates.lng
                    );
                    shopObj.distance = distance;
                }
                return shopObj;
            });

            // Filter by radius if provided
            if (lat && lng && radius) {
                const radiusKm = parseFloat(radius as string);
                results = results.filter((shop: any) =>
                    shop.distance !== null && shop.distance <= radiusKm
                );
            }

            // Sort by distance if location provided
            if (lat && lng) {
                results.sort((a: any, b: any) => {
                    if (a.distance === null) return 1;
                    if (b.distance === null) return -1;
                    return a.distance - b.distance;
                });
            }

            res.status(200).json(results);
        } catch (error: any) {
            console.error('Error fetching shops:', error);
            res.status(500).json({ message: error.message || 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
