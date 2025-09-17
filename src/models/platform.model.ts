
import mongoose, { Document, Schema, Model } from 'mongoose';

// Re-using the banner schema from brand model to ensure consistency
const HeroBannerSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
}, { _id: false });


export interface IPlatformSettings extends Document {
  heroBanners: {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  }[];
  featuredCategories: string[];
}

const PlatformSettingsSchema: Schema<IPlatformSettings> = new Schema({
  heroBanners: [HeroBannerSchema],
  featuredCategories: { type: [String], default: [] },
}, { timestamps: true });

const PlatformSettings: Model<IPlatformSettings> = mongoose.models.PlatformSettings || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;
