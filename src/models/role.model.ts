import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRole extends Document {
  name: 'user' | 'admin';
}

const RoleSchema: Schema<IRole> = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    unique: true,
  },
});

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
