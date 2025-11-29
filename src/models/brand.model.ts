

import mongoose, { Document, Schema, Model } from 'mongoose';

interface IBanner {
    title?: string;
    description?: string;
    imageUrl: string;
    imageHint: string;
    buttonLink?: string;
}

<<<<<<< HEAD
interface IReview {
=======
interface IOffer {
    title: string;
    description: string;
    code: string;
}

export interface IReview {
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
    customerName: string;
    rating: number;
    reviewText: string;
    customerAvatarUrl: string;
}

interface IPromoBanner {
    title?: string;
    description?: string;
    imageUrl?: string;
    imageHint?: string;
    buttonText?: string;
    buttonLink?: string;
}

export interface ICategoryGridItem {
    category: string;
    title: string;
    description: string;
    images: { url: string; hint?: string }[];
    buttonLink: string;
}

interface ISocialLinks {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
}

interface ITheme {
    primary: string;
    background: string;
    accent: string;
}


export interface IBrand extends Document {
  displayName: string;
  permanentName: string;
  logoUrl: string;
  banners: IBanner[];
  themeName: string;
  theme: ITheme;
  reviews: IReview[];
  promoBanner: IPromoBanner;
  categories: string[];
  socials?: ISocialLinks;
  categoryGrid: ICategoryGridItem[];
}

const BannerSchema: Schema<IBanner> = new Schema({
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    buttonLink: { type: String },
}, { _id: false });

const ReviewSchema: Schema<IReview> = new Schema({
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    customerAvatarUrl: { type: String, required: true },
}, { _id: false });

const PromoBannerSchema: Schema<IPromoBanner> = new Schema({
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    imageHint: { type: String },
    buttonText: { type: String },
    buttonLink: { type: String },
}, { _id: false });

const CategoryGridItemSchema: Schema<ICategoryGridItem> = new Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{
        url: { type: String, required: true },
        hint: { type: String }
    }],
    buttonLink: { type: String, required: true },
}, { _id: false });


const SocialLinksSchema: Schema<ISocialLinks> = new Schema({
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
}, { _id: false });

const ThemeSchema: Schema<ITheme> = new Schema({
    primary: { type: String, required: true },
    background: { type: String, required: true },
    accent: { type: String, required: true },
}, { _id: false });


const BrandSchema: Schema<IBrand> = new Schema({
  displayName: { type: String, required: true },
  permanentName: { type: String, required: true, unique: true, index: true },
  logoUrl: { type: String, required: true },
  banners: [BannerSchema],
  themeName: { type: String, required: true },
  theme: { type: ThemeSchema, required: true },
  reviews: [ReviewSchema],
  promoBanner: PromoBannerSchema,
  categories: { type: [String], default: [] },
  socials: SocialLinksSchema,
  categoryGrid: { type: [CategoryGridItemSchema], default: [] },
}, { timestamps: true });

const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
