import mongoose, { Schema, Document } from 'mongoose';

export interface IQuery extends Document {
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  responses: Array<{
    user: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const QuerySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    responses: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

QuerySchema.index({ user: 1 });
QuerySchema.index({ status: 1 });
QuerySchema.index({ createdAt: -1 });

export default mongoose.models.Query || mongoose.model<IQuery>('Query', QuerySchema);






