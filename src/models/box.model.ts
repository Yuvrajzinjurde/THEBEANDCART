
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBoxVariant extends Document {
  name: string; // e.g., 'Small', 'Medium', 'Red Velvet'
  size?: string;
  color?: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  images: string[];
}

export interface IBox extends Document {
  name: string; // e.g., 'Classic Cardboard Box', 'Luxury Jewelry Box'
  description: string;
  boxType: 'box' | 'bag';
  variants: IBoxVariant[];
  likes: number;
  usageCount: number;
}

const BoxVariantSchema: Schema<IBoxVariant> = new Schema({
  name: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  mrp: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String, required: true }],
}, { _id: true });


const BoxSchema: Schema<IBox> = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  boxType: { type: String, enum: ['box', 'bag'], required: true },
  variants: [BoxVariantSchema],
  likes: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true });


const Box: Model<IBox> = mongoose.models.Box || mongoose.model<IBox>('Box', BoxSchema);

export default Box;
