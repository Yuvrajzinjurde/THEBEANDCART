

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IAddress extends Document {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: 'Home' | 'Office' | 'Other';
  otherType?: string;
  isDefault: boolean;
}

export interface ISocials {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Password is not always sent back
  phone?: string;
  whatsapp?: string;
  isPhoneVerified: boolean;
  isWhatsappVerified: boolean;
  addresses: IAddress[];
  socials?: ISocials;
  profilePicUrl?: string;
  roles: Types.ObjectId[];
  brand: string; // The permanent name of the brand the user belongs to
  status: 'active' | 'blocked';
  isDeleted: boolean; // New field for soft delete
  createdAt: string | Date;
  updatedAt: string | Date;
}

const AddressSchema: Schema<IAddress> = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  type: { type: String, enum: ['Home', 'Office', 'Other'], required: true },
  otherType: { type: String },
  isDefault: { type: Boolean, default: false },
});

const SocialsSchema: Schema<ISocials> = new Schema({
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
}, { _id: false });


const UserSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  whatsapp: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  isWhatsappVerified: { type: Boolean, default: false },
  addresses: [AddressSchema],
  socials: SocialsSchema,
  profilePicUrl: { type: String },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  brand: { type: String, index: true, required: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active', index: true },
  isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
