
import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { notificationTypes } from '@/lib/notification-schema';

export type NotificationType = typeof notificationTypes[number];

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const NotificationSchema: Schema<INotification> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: notificationTypes, required: true },
  isRead: { type: Boolean, default: false, index: true },
  link: { type: String },
}, { timestamps: true });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
