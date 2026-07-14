import mongoose, { Schema, Model } from 'mongoose';
import { NotificationType } from '../types/index.js';

export interface INotificationDocument {
  recipient: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
    relatedEntityType: { type: String, trim: true },
    relatedEntityId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification: Model<INotificationDocument> = mongoose.model<INotificationDocument>('Notification', notificationSchema);
export default Notification;
