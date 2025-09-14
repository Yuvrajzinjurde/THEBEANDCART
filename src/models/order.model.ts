
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IOrderProduct {
    productId: Types.ObjectId;
    quantity: number;
    price: number; // Price at the time of order
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'on-hold' | 'ready-to-ship';
  brand: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const OrderProductSchema: Schema<IOrderProduct> = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
}, { _id: false });

const OrderSchema: Schema<IOrder> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [OrderProductSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled', 'on-hold', 'ready-to-ship'],
    default: 'pending',
    index: true,
  },
  brand: { type: String, required: true, index: true },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
