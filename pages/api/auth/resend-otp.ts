import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';
import { sendOTPSMS } from '@/lib/sms';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    if (user.email) {
      await sendOTPEmail(user.email, otp);
    }
    if (user.phone) {
      await sendOTPSMS(user.phone, otp);
    }

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}






