import mongoose, { Schema, Document } from 'mongoose';

export interface ISOSAlert extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  status: 'COUNTDOWN' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  countdownSeconds: number;
  notifiedContacts: {
    name: string;
    phone: string;
    status: 'SENT' | 'SIMULATED_DEV_MODE' | 'FAILED';
  }[];
  activationSource: 'ONE_TOUCH_BUTTON' | 'SAFETY_TIMER_EXPIRED' | 'VOICE_TRIGGER' | 'SHAKE_GESTURE';
  audioRecordingUrl?: string;
  notes?: string;
  resolvedAt?: Date;
  resolutionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SOSAlertSchema = new Schema<ISOSAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ['COUNTDOWN', 'ACTIVE', 'RESOLVED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number, default: 10 },
      address: { type: String, default: 'Location Acquired via GPS' },
    },
    countdownSeconds: { type: Number, default: 5 },
    notifiedContacts: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        status: { type: String, enum: ['SENT', 'SIMULATED_DEV_MODE', 'FAILED'], default: 'SIMULATED_DEV_MODE' },
      },
    ],
    activationSource: {
      type: String,
      enum: ['ONE_TOUCH_BUTTON', 'SAFETY_TIMER_EXPIRED', 'VOICE_TRIGGER', 'SHAKE_GESTURE'],
      default: 'ONE_TOUCH_BUTTON',
    },
    audioRecordingUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    resolvedAt: { type: Date },
    resolutionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SOSAlertModel = mongoose.models.SOSAlert || mongoose.model<ISOSAlert>('SOSAlert', SOSAlertSchema);
