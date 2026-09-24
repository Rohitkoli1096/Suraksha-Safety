import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  category: 'AUTH' | 'SOS' | 'REPORT' | 'COMMUNITY' | 'ADMIN' | 'SYSTEM';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    category: {
      type: String,
      enum: ['AUTH', 'SOS', 'REPORT', 'COMMUNITY', 'ADMIN', 'SYSTEM'],
      required: true,
      index: true,
    },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLogModel =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
