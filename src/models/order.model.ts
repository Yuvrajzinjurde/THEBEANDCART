

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IOrderProduct {
    productId: Types.ObjectId;
    quantity: number;
    price: number; // Price at the time of order
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  orderId: string;
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
  createdAt: string | Date;
  updatedAt: string | Date;
}

const OrderProductSchema: Schema<IOrderProduct> = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
}, { _id: false });

const OrderSchema: Schema<IOrder> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true, unique: true, index: true },
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

// Pre-save hook to generate the numeric order ID
OrderSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Generate a random 6-digit number
        const randomPart = Math.floor(100000 + Math.random() * 900000);
        this.orderId = `ORD-${randomPart}`;
        // You could add a check here to ensure uniqueness, but for this scope, a random number is sufficient.
    }
    next();
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
