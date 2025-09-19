
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IHamper extends Document {
  userId: Types.ObjectId;
  occasion: string;
  boxId: Types.ObjectId;
  boxVariantId: Types.ObjectId;
  products: Types.ObjectId[];
  notesToCreator?: string;
  notesToReceiver?: string;
  isComplete: boolean;
}

const HamperSchema: Schema<IHamper> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  occasion: { type: String, required: true },
  boxId: { type: Schema.Types.ObjectId, ref: 'Box', required: true },
  boxVariantId: { type: Schema.Types.ObjectId, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  notesToCreator: { type: String },
  notesToReceiver: { type: String },
  isComplete: { type: Boolean, default: false },
}, { timestamps: true });

const Hamper: Model<IHamper> = mongoose.models.Hamper || mongoose.model<IHamper>('Hamper', HamperSchema);

export default Hamper;
