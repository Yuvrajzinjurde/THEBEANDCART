
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  freeShippingThreshold: number;
  extraDiscountThreshold: number;
  freeGiftThreshold: number;
}

const SettingsSchema: Schema<ISettings> = new Schema({
  freeShippingThreshold: { type: Number, required: true, default: 399 },
  extraDiscountThreshold: { type: Number, required: true, default: 799 },
  freeGiftThreshold: { type: Number, required: true, default: 999 },
}, { timestamps: true });

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
