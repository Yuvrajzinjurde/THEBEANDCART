
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

<<<<<<< HEAD
export interface IAddress extends Document {
  name: string;
=======
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
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
<<<<<<< HEAD
  type: 'Home' | 'Office' | 'Other';
  otherType?: string;
  isDefault: boolean;
}

export interface ISocials {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
=======
  isDefault: boolean;
  addressType: string;
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  password?: string; // Password is not always sent back
  phone?: string;
<<<<<<< HEAD
  whatsapp?: string;
  isPhoneVerified: boolean;
  isWhatsappVerified: boolean;
  addresses: IAddress[];
  socials?: ISocials;
=======
  isPhoneVerified: boolean;
  whatsapp?: string;
  addresses: IAddress[];
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
  profilePicUrl?: string;
  roles: Types.ObjectId[];
  brand: string; // The permanent name of the brand the user belongs to
  status: 'active' | 'blocked';
<<<<<<< HEAD
  isDeleted: boolean; // New field for soft delete
=======
  socials?: ISocialLinks;
  nickname?: string;
  displayName?: string;
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
  createdAt: string | Date;
  updatedAt: string | Date;
}

<<<<<<< HEAD
const AddressSchema: Schema<IAddress> = new Schema({
  name: { type: String, required: true },
=======
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
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
<<<<<<< HEAD
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

=======
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
  addressType: { type: String, required: true },
});

>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

const UserSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
<<<<<<< HEAD
  isEmailVerified: { type: Boolean, default: false },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  whatsapp: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  isWhatsappVerified: { type: Boolean, default: false },
  addresses: [AddressSchema],
  socials: SocialsSchema,
=======
  password: { type: String, select: false },
  phone: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  whatsapp: { type: String },
  addresses: [AddressSchema],
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
  profilePicUrl: { type: String },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  brand: { type: String, index: true, required: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active', index: true },
<<<<<<< HEAD
  isDeleted: { type: Boolean, default: false, index: true },
=======
  socials: SocialLinksSchema,
  nickname: { type: String },
  displayName: { type: String },
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
