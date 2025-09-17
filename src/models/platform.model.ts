
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


export interface IPlatformSettings extends Document {
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
  heroBanners: [HeroBannerSchema],
  featuredCategories: { type: [String], default: [] },
  promoBanner: PromoBannerSchema,
  offers: [OfferSchema],
}, { timestamps: true });

const PlatformSettings: Model<IPlatformSettings> = mongoose.models.PlatformSettings || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;

    