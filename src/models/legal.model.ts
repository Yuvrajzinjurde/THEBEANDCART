import mongoose, { Document, Schema, Model } from 'mongoose';

export const legalDocTypes = [
    'about-us', 
    'contact-us', 
    'privacy-policy', 
    'terms-and-conditions', 
    'refund-policy', 
    'shipping-policy'
] as const;

export type LegalDocType = typeof legalDocTypes[number];

export interface ILegal extends Document {
  brand: string; // permanentName of the brand
  docType: LegalDocType;
  title: string;
  content: string;
}

const LegalSchema: Schema<ILegal> = new Schema({
  brand: { type: String, required: true, index: true },
  docType: { type: String, enum: legalDocTypes, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

LegalSchema.index({ brand: 1, docType: 1 }, { unique: true });

const Legal: Model<ILegal> = mongoose.models.Legal || mongoose.model<ILegal>('Legal', LegalSchema);

export default Legal;
