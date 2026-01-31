import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UTApi } from 'uploadthing/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';

const utapi = new UTApi();

// DELETE /api/files/[id] - Delete a file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    const { id } = await params;

    await connectDB();

    // Find the file and verify ownership
    const file = await File.findOne({ _id: id, userId: decoded.userId });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from Uploadthing
    try {
      await utapi.deleteFiles(file.key);
    } catch (uploadthingError) {
      console.error('Error deleting from Uploadthing:', uploadthingError);
      // Continue with MongoDB deletion even if Uploadthing fails
    }

    // Delete from MongoDB
    await File.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

// GET /api/files/[id] - Get a single file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    const { id } = await params;

    await connectDB();

    const file = await File.findOne({ _id: id, userId: decoded.userId });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}
