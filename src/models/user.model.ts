
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ISocialLinks {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
    telegram?: string;
}

export interface IAddress extends Document {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  addressType: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Password is not always sent back
  phone?: string;
  isPhoneVerified: boolean;
  whatsapp?: string;
  addresses: IAddress[];
  profilePicUrl?: string;
  roles: Types.ObjectId[];
  brand: string; // The permanent name of the brand the user belongs to
  status: 'active' | 'blocked';
  socials?: ISocialLinks;
  nickname?: string;
  displayName?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const SocialLinksSchema: Schema<ISocialLinks> = new Schema({
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    website: { type: String },
    telegram: { type: String },
}, { _id: false });

const AddressSchema: Schema<IAddress> = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
  addressType: { type: String, required: true },
});


const UserSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, select: false },
  phone: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  whatsapp: { type: String },
  addresses: [AddressSchema],
  profilePicUrl: { type: String },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  brand: { type: String, index: true, required: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active', index: true },
  socials: SocialLinksSchema,
  nickname: { type: String },
  displayName: { type: String },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
