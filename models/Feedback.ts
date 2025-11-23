import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  type: 'product' | 'service' | 'general';
  rating: number; // 1-5
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  response?: string; // Response from seller
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    type: {
      type: String,
      enum: ['product', 'service', 'general'],
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    response: { type: String },
  },
  { timestamps: true }
);

FeedbackSchema.index({ product: 1 });
FeedbackSchema.index({ user: 1 });
FeedbackSchema.index({ status: 1 });

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);






