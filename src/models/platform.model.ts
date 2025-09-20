
import mongoose, { Document, Schema, Model } from 'mongoose';

const HeroBannerSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
}, { _id: false });

const PromoBannerSchema: Schema = new Schema({
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    imageHint: { type: String },
    buttonText: { type: String },
    buttonLink: { type: String },
}, { _id: false });

const OfferSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
}, { _id: false });

const SocialLinksSchema: Schema = new Schema({
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
}, { _id: false });


export interface IPlatformSettings extends Document {
  platformName: string;
  platformLogoUrl: string;
  platformFaviconUrl: string;
  platformThemeName: string;
  socials?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  aiEnabled: boolean;
  hamperFeatureEnabled: boolean;
  offersFeatureEnabled: boolean;
  heroBanners: {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  }[];
  featuredCategories: string[];
  promoBanner?: {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
    buttonText: string;
    buttonLink: string;
  };
  offers: {
    title: string;
    description: string;
    code: string;
  }[];
}

const PlatformSettingsSchema: Schema<IPlatformSettings> = new Schema({
  platformName: { type: String, default: 'The Brand Cart' },
  platformLogoUrl: { type: String, default: '' },
  platformFaviconUrl: { type: String, default: '' },
  platformThemeName: { type: String, default: 'Blue' },
  socials: SocialLinksSchema,
  aiEnabled: { type: Boolean, default: true },
  hamperFeatureEnabled: { type: Boolean, default: true },
  offersFeatureEnabled: { type: Boolean, default: true },
  heroBanners: [HeroBannerSchema],
  featuredCategories: { type: [String], default: [] },
  promoBanner: PromoBannerSchema,
  offers: [OfferSchema],
}, { timestamps: true });

const PlatformSettings: Model<IPlatformSettings> = mongoose.models.PlatformSettings || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;
