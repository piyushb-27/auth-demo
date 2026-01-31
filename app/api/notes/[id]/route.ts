import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to verify user and get userId from JWT
function verifyToken(request: NextRequest): { userId: string } | null {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}

// GET /api/notes/[id] - Get single note by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find note
    const note = await Note.findById(id).lean();

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (note.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this note' },
        { status: 403 }
      );
    }

    return NextResponse.json({ note }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find note
    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (note.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this note' },
        { status: 403 }
      );
    }

    // Get update data
    const body = await request.json();
    const { title, content, tags, folder, isPinned } = body;

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (folder !== undefined) note.folder = folder;
    if (isPinned !== undefined) note.isPinned = isPinned;
    
    // updatedAt will be set automatically by pre-save hook
    note.updatedAt = new Date();

    await note.save();

    return NextResponse.json(
      { message: 'Note updated successfully', note },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Find note
    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (note.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this note' },
        { status: 403 }
      );
    }

    // Delete note
    await Note.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Note deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note', details: error.message },
      { status: 500 }
    );
  }
}
