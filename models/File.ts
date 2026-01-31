import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  url: string;
  key: string;
  type: string;
  size: number;
  folder: string;
  createdAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folder: {
      type: String,
      default: 'General',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient querying
FileSchema.index({ userId: 1, createdAt: -1 });
FileSchema.index({ userId: 1, folder: 1 });

const File: Model<IFile> =
  mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

export default File;
