import mongoose, { Document, Schema, Model } from 'mongoose';

export const legalDocTypes = [
    'about-us', 
    'contact-us', 
    'privacy-policy', 
    'terms-and-conditions', 
    'refund-policy', 
    'shipping-policy',
    'return-policy'
] as const;

export type LegalDocType = typeof legalDocTypes[number];

export interface ILegal extends Document {
  docType: LegalDocType;
  title: string;
  content: string;
}

const LegalSchema: Schema<ILegal> = new Schema({
  docType: { type: String, enum: legalDocTypes, required: true, unique: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });


const Legal: Model<ILegal> = mongoose.models.Legal || mongoose.model<ILegal>('Legal', LegalSchema);

export default Legal;
