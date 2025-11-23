import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'online' | 'offline' | 'cod';
  fulfillmentMethod: 'delivery' | 'pickup';
  paymentId?: string; // Stripe payment intent ID
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  deliveryDate?: Date;
  scheduledDate?: Date; // For offline orders
  trackingNumber?: string;
  notes?: string;
  retailer?: mongoose.Types.ObjectId; // If order is from retailer to wholesaler
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'offline', 'cod'],
      required: true,
    },
    fulfillmentMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery',
    },
    paymentId: { type: String },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    deliveryDate: { type: Date },
    scheduledDate: { type: Date },
    trackingNumber: { type: String },
    notes: { type: String },
    retailer: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

OrderSchema.index({ customer: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);






