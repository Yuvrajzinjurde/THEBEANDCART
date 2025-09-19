
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBox extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  size?: string;
  color?: string;
  stock: number;
  storefront: string;
  likes: number;
  usageCount: number;
}

const BoxSchema: Schema<IBox> = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, required: true }],
  size: { type: String },
  color: { type: String },
  stock: { type: Number, required: true, min: 0, default: 0 },
  storefront: { type: String, required: true, index: true },
  likes: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true });


const Box: Model<IBox> = mongoose.models.Box || mongoose.model<IBox>('Box', BoxSchema);

export default Box;
