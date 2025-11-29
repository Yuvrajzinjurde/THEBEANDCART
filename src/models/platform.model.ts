
import mongoose, { Document, Schema, Model } from 'mongoose';

const HeroBannerSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    buttonLink: { type: String, required: false },
}, { _id: false });

const PromoBannerSchema: Schema = new Schema({
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    imageHint: { type: String },
    buttonText: { type: String },
    buttonLink: { type: String },
}, { _id: false });

const SocialLinksSchema: Schema = new Schema({
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
}, { _id: false });

const ThemeSchema: Schema = new Schema({
    name: { type: String, required: true },
    primary: { type: String, required: true },
    background: { type: String, required: true },
    accent: { type: String, required: true },
}, { _id: false });


export interface IPlatformSettings extends Document {
  platformName: string;
  platformDescription: string;
  platformLogoUrl: string;
  platformFaviconUrl: string;
  theme: {
    name: string;
    primary: string;
    background: string;
    accent: string;
  };
  socials?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  aiEnabled: boolean;
  hamperFeatureEnabled: boolean;
  promoBannerEnabled: boolean;
  cancellableOrderStatus: 'pending' | 'ready-to-ship';
  heroBanners: {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
    buttonLink: string;
  }[];
  featuredCategories: string[];
  featuredBrands: string[];
  promoBanner?: {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
    buttonText: string;
    buttonLink: string;
  };
}

const PlatformSettingsSchema: Schema<IPlatformSettings> = new Schema({
  platformName: { type: String, default: 'The Brand Cart' },
  platformDescription: { type: String, default: 'Your one-stop shop for amazing brands.' },
  platformLogoUrl: { type: String, default: '' },
  platformFaviconUrl: { type: String, default: '' },
<<<<<<< HEAD
  theme: { type: ThemeSchema, default: () => ({ name: 'Blue', primary: '217.2 91.2% 59.8%', background: '0 0% 100%', accent: '210 40% 96.1%'}) },
=======
  platformThemeName: { type: String, default: 'Slate (Dark)' },
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
  socials: SocialLinksSchema,
  aiEnabled: { type: Boolean, default: true },
  hamperFeatureEnabled: { type: Boolean, default: true },
  promoBannerEnabled: { type: Boolean, default: true },
  cancellableOrderStatus: { type: String, enum: ['pending', 'ready-to-ship'], default: 'pending' },
  heroBanners: [HeroBannerSchema],
  featuredCategories: { type: [String], default: [] },
  featuredBrands: { type: [String], default: [] },
  promoBanner: PromoBannerSchema,
}, { timestamps: true });

const PlatformSettings: Model<IPlatformSettings> = mongoose.models.PlatformSettings || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;
