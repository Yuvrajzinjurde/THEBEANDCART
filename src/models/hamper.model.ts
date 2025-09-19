

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IHamper extends Document {
  userId: Types.ObjectId;
  occasion: string;
  boxId: Types.ObjectId;
  boxVariantId: Types.ObjectId;
  bagId?: Types.ObjectId;
  bagVariantId?: Types.ObjectId;
  products: Types.ObjectId[];
  notesToCreator?: string;
  notesToReceiver?: string;
  addRose?: boolean;
  isComplete: boolean;
  isAddedToCart: boolean; // New field
}

const HamperSchema: Schema<IHamper> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  occasion: { type: String, required: true },
  boxId: { type: Schema.Types.ObjectId, ref: 'Box' },
  boxVariantId: { type: Schema.Types.ObjectId },
  bagId: { type: Schema.Types.ObjectId, ref: 'Box' },
  bagVariantId: { type: Schema.Types.ObjectId },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  notesToCreator: { type: String },
  notesToReceiver: { type: String },
  addRose: { type: Boolean, default: false },
  isComplete: { type: Boolean, default: false },
  isAddedToCart: { type: Boolean, default: false }, // New field
}, { timestamps: true });

const Hamper: Model<IHamper> = mongoose.models.Hamper || mongoose.model<IHamper>('Hamper', HamperSchema);

export default Hamper;
