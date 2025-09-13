
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  brand: string;
}

const ProductSchema: Schema<IProduct> = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, index: true },
  images: [{ type: String, required: true }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  brand: { type: String, required: true, index: true },
}, { timestamps: true });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
