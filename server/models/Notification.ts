import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'SOS_ALERT' | 'REPORT_STATUS_CHANGED' | 'COMMUNITY_MENTION' | 'SAFETY_WARNING' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['SOS_ALERT', 'REPORT_STATUS_CHANGED', 'COMMUNITY_MENTION', 'SAFETY_WARNING', 'SYSTEM_ANNOUNCEMENT'],
      default: 'SYSTEM_ANNOUNCEMENT',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    linkUrl: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
