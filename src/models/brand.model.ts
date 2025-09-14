
import mongoose, { Document, Schema, Model } from 'mongoose';

interface IBanner {
    title: string;
    description: string;
    imageUrl: string;
    imageHint: string;
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
  theme: ITheme;
}

const BannerSchema: Schema<IBanner> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
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
  theme: { type: ThemeSchema, required: true },
}, { timestamps: true });

const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
