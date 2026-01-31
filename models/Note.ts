import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Note',
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  folder: {
    type: String,
    default: 'General',
    trim: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
NoteSchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt timestamp on save
NoteSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
