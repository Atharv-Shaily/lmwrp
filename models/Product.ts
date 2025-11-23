import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  images: string[];
  price: number;
  stock: number;
  minOrderQuantity?: number;
  availabilityDate?: Date;
  seller: mongoose.Types.ObjectId; // Retailer or Wholesaler ID
  sellerType: 'retailer' | 'wholesaler';
  isProxy?: boolean; // For retailer showing wholesaler items
  proxySource?: mongoose.Types.ObjectId; // Wholesaler ID if proxy
  status: 'active' | 'inactive' | 'out_of_stock';
  specifications?: Record<string, any>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    minOrderQuantity: { type: Number, default: 1 },
    availabilityDate: { type: Date },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerType: {
      type: String,
      enum: ['retailer', 'wholesaler'],
      required: true,
    },
    isProxy: { type: Boolean, default: false },
    proxySource: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
    specifications: { type: Schema.Types.Mixed },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ seller: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);






