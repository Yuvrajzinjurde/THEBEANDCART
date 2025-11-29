
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IVariant extends Document {
  sku: string;
  color?: string;
  size?: string;
  availableQuantity: number;
  images: string[];
  videos?: string[];
}

export interface IProduct extends Document {
  name: string;
  description: string;
  mainImage: string;
  mrp?: number;
  sellingPrice: number;
  purchasePrice?: number;
  category: string;
  images: string[];
  videos?: string[];
  stock: number;
  rating: number;
  brand: string;
  storefront: string;
  views: number;
  clicks: number;
  keywords: string[];
  returnPeriod: number;
  maxOrderQuantity: number;
  styleId?: string;
  sku?: string;
  variants: IVariant[];
}

const VariantSchema = new Schema<IVariant>(
  {
    sku: { type: String, required: true },
    color: { type: String },
    size: { type: String },
    availableQuantity: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    videos: [{ type: String }],
  },
  { _id: true }
);

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true },
    mrp: { type: Number, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    images: [{ type: String, required: true }],
    videos: [{ type: String }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    brand: { type: String, required: true, index: true },
    storefront: { type: String, required: true, index: true },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    keywords: { type: [String], default: [], index: true },
    returnPeriod: { type: Number, default: 10 },
    maxOrderQuantity: { type: Number, default: 5 },
    styleId: { type: String, index: true },
    sku: { type: String, index: true, unique: true, sparse: true },
    variants: [VariantSchema],
  },
  { timestamps: true }
);

// Virtual field for backwards compatibility
ProductSchema.virtual('price').get(function () {
  return this.sellingPrice;
});

// Enable text index for keyword search optimization
ProductSchema.index({ name: 'text', brand: 'text', category: 'text', keywords: 'text' });

// Compound index to quickly find variants of a style
ProductSchema.index({ styleId: 1, storefront: 1 });

// Index for sorting
ProductSchema.index({ storefront: 1, createdAt: -1 });
ProductSchema.index({ storefront: 1, 'rating': -1 });
ProductSchema.index({ storefront: 1, 'clicks': -1, 'views': -1 });
ProductSchema.index({ storefront: 1, 'sellingPrice': 1 });


const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
