import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Folder from '@/models/Folder';
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

// PUT /api/folders/[id] - Update folder
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
        { error: 'Invalid folder ID' },
        { status: 400 }
      );
    }

    // Find folder
    const folder = await Folder.findById(id);

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (folder.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this folder' },
        { status: 403 }
      );
    }

    // Get update data
    const body = await request.json();
    const { name, color } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return NextResponse.json(
          { error: 'Folder name cannot be empty' },
          { status: 400 }
        );
      }
      folder.name = name.trim();
    }

    if (color !== undefined) {
      folder.color = color;
    }

    await folder.save();

    return NextResponse.json(
      { message: 'Folder updated successfully', folder },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[id] - Delete folder
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
        { error: 'Invalid folder ID' },
        { status: 400 }
      );
    }

    // Find folder
    const folder = await Folder.findById(id);

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (folder.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this folder' },
        { status: 403 }
      );
    }

    // Update all notes using this folder to "General"
    await Note.updateMany(
      { userId: auth.userId, folder: folder.name },
      { $set: { folder: 'General', updatedAt: new Date() } }
    );

    // Delete folder
    await Folder.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Folder deleted successfully, notes moved to General' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder', details: error.message },
      { status: 500 }
    );
  }
}
