import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';
import { sendOTPSMS } from '@/lib/sms';
import { geocodeAddress } from '@/lib/location';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { name, email, password, phone, role, location, businessName, businessLicense } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Geocode location if provided
    let coordinates = null;
    if (location?.address) {
      coordinates = await geocodeAddress(
        `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`
      );
    }

    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      isVerified: false,
      otp,
      otpExpiry,
      location: location
        ? {
            ...location,
            coordinates: coordinates || { lat: 0, lng: 0 },
          }
        : undefined,
      businessName,
      businessLicense,
    });

    // Send OTP
    if (email) {
      await sendOTPEmail(email, otp);
    }
    if (phone) {
      await sendOTPSMS(phone, otp);
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your OTP.',
      userId: user._id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}






