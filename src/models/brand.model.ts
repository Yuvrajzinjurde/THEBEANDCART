
import mongoose, { Document, Schema, Model } from 'mongoose';

interface IBanner {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
}

interface IOffer {
    title: string;
    description: string;
    code: string;
}

interface IReview {
    customerName: string;
    rating: number;
    reviewText: string;
    customerAvatarUrl: string;
}

interface IPromoBanner {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
    buttonText: string;
    buttonLink: string;
}

interface ICategoryBanner {
    categoryName: string;
    imageUrl: string;
    imageHint: string;
}

interface ISocialLinks {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
}


export interface IBrand extends Document {
  displayName: string;
  permanentName: string;
  logoUrl: string;
  banners: IBanner[];
  themeName: string;
  offers: IOffer[];
  reviews: IReview[];
  promoBanner: IPromoBanner;
  categoryBanners: ICategoryBanner[];
  categories: string[];
  socials?: ISocialLinks;
}

const BannerSchema: Schema<IBanner> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
}, { _id: false });

const OfferSchema: Schema<IOffer> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
}, { _id: false });

const ReviewSchema: Schema<IReview> = new Schema({
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    customerAvatarUrl: { type: String, required: true },
}, { _id: false });

const PromoBannerSchema: Schema<IPromoBanner> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    buttonText: { type: String, required: true },
    buttonLink: { type: String, required: true },
}, { _id: false });

const CategoryBannerSchema: Schema<ICategoryBanner> = new Schema({
    categoryName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
}, { _id: false });

const SocialLinksSchema: Schema<ISocialLinks> = new Schema({
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
}, { _id: false });


const BrandSchema: Schema<IBrand> = new Schema({
  displayName: { type: String, required: true },
  permanentName: { type: String, required: true, unique: true, index: true },
  logoUrl: { type: String, required: true },
  banners: [BannerSchema],
  themeName: { type: String, required: true },
  offers: [OfferSchema],
  reviews: [ReviewSchema],
  promoBanner: PromoBannerSchema,
  categoryBanners: [CategoryBannerSchema],
  categories: { type: [String], default: [] },
  socials: SocialLinksSchema,
}, { timestamps: true });

const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
