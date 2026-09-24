import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityComment {
  userId: mongoose.Types.ObjectId;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  userId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: 'USER' | 'ADMIN' | 'RESPONDER';
  title: string;
  content: string;
  category: 'SAFETY_TIP' | 'ALERT' | 'UPDATE' | 'COMMUNITY_WATCH';
  locationName?: string;
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  comments: ICommunityComment[];
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityCommentSchema = new Schema<ICommunityComment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, enum: ['USER', 'ADMIN', 'RESPONDER'], default: 'USER' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['SAFETY_TIP', 'ALERT', 'UPDATE', 'COMMUNITY_WATCH'],
      default: 'SAFETY_TIP',
    },
    locationName: { type: String, default: '' },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommunityCommentSchema],
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CommunityPostModel =
  mongoose.models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
