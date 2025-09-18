
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  mrp?: number; // Original Price (Maximum Retail Price)
  sellingPrice: number; // Discounted/Selling Price
  category: string[]; // Can be single or multiple categories
  images: string[];
  stock: number;
  rating: number;
  brand: string; // The product's actual brand, e.g., "Nike"
  storefront: string; // The storefront this product belongs to, e.g., "reeva"
  views: number;
  clicks: number;
  keywords: string[]; // New keywords field
  returnPeriod: number; // Number of days for return
  // New fields for variants
  styleId?: string; // Groups variants together
  color?: string;
  size?: string;
}

const ProductSchema: Schema<IProduct> = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  mrp: { type: Number, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  category: { type: [String], required: true, index: true },
  images: [{ type: String, required: true }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  brand: { type: String, required: true },
  storefront: { type: String, required: true, index: true },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  keywords: { type: [String], default: [] },
  returnPeriod: { type: Number, default: 10 },
  styleId: { type: String, index: true },
  color: { type: String },
  size: { type: String },
}, { timestamps: true });

// For backwards compatibility, rename 'price' to 'sellingPrice' where it might be used
ProductSchema.virtual('price').get(function() {
  return this.sellingPrice;
});


// Compound index to quickly find variants of a style
ProductSchema.index({ styleId: 1, storefront: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
