
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IRejection extends Document {
  orderId: Types.ObjectId;
  reason: string;
  rejectedBy: Types.ObjectId;
}

const RejectionSchema: Schema<IRejection> = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  reason: { type: String, required: true },
  rejectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Rejection: Model<IRejection> = mongoose.models.Rejection || mongoose.model<IRejection>('Rejection', RejectionSchema);

export default Rejection;
