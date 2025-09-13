import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Password is not always sent back
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  profilePicUrl?: string;
  roles: Types.ObjectId[];
  // Example e-commerce fields
  orders: Types.ObjectId[];
  wishlist: Types.ObjectId[];
}

const UserSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  profilePicUrl: { type: String },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
