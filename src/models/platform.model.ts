
import mongoose, { Document, Schema, Model } from 'mongoose';
import { z } from 'zod';

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

// Zod schema for form validation
export const PlatformSettingsValidationSchema = z.object({
  heroBanners: z.array(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      imageUrl: z.string().url("Must be a valid URL or data URI.").min(1, "Image is required"),
      imageHint: z.string().min(1, "Image hint is required"),
  })).min(1, "At least one hero banner is required"),
  featuredCategories: z.array(z.object({ name: z.string() })).optional(),
});

export type PlatformSettingsValues = z.infer<typeof PlatformSettingsValidationSchema>;
