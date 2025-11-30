

import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IProduct } from './product.model';

export interface ICartItem {
    productId: Types.ObjectId | IProduct; // Can be populated
    quantity: number;
    size?: string;
    color?: string;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

const CartItemSchema: Schema<ICartItem> = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
}, { _id: false });


const CartSchema: Schema<ICart> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [CartItemSchema],
}, { timestamps: true });


CartSchema.virtual('totalItems').get(function(this: ICart) {
    return this.items.reduce((total: number, item: ICartItem) => total + item.quantity, 0);
});

// Ensure virtuals are included
CartSchema.set('toObject', { virtuals: true });
CartSchema.set('toJSON', { virtuals: true });


const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
