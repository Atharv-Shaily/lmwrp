import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'customer' | 'retailer' | 'wholesaler';
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  location?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  businessName?: string; // For retailers and wholesalers
  businessLicense?: string;
  socialAuth?: {
    provider: 'google' | 'facebook';
    providerId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ['customer', 'retailer', 'wholesaler'],
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    businessName: { type: String },
    businessLicense: { type: String },
    socialAuth: {
      provider: { type: String, enum: ['google', 'facebook'] },
      providerId: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);






