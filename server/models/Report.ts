import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  authorName: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  upvotesCount: number;
  upvotedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'STREET_LIGHTING',
        'HARASSMENT_HAZARD',
        'POOR_VISIBILITY',
        'DESERTED_AREA',
        'SUSPICIOUS_ACTIVITY',
        'INFRASTRUCTURE_ISSUE',
        'OTHER',
      ],
      default: 'STREET_LIGHTING',
      index: true,
    },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: 'Reported Location' },
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    upvotesCount: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
