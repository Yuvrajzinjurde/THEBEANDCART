
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed' | 'free-shipping';
  value?: number; // This field is optional
  minPurchase: number;
  brand: string; // 'All Brands' or a specific brand permanentName
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

const CouponSchema: Schema<ICoupon> = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'fixed', 'free-shipping'], required: true },
  value: { type: Number, required: false, min: 0 }, // This is the fix: 'required: false'
  minPurchase: { type: Number, required: true, default: 0 },
  brand: { type: String, required: true, index: true },
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });


CouponSchema.virtual('isActive').get(function(this: ICoupon) {
    const now = new Date();
    const hasStarted = this.startDate ? this.startDate <= now : true;
    const hasNotExpired = this.endDate ? this.endDate >= now : true;
    return hasStarted && hasNotExpired;
});

// Ensure virtuals are included
CouponSchema.set('toObject', { virtuals: true });
CouponSchema.set('toJSON', { virtuals: true });

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
