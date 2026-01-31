import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';

// GET /api/files - Get all files for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const type = searchParams.get('type');

    // Build query
    const query: Record<string, unknown> = { userId: decoded.userId };
    
    if (folder && folder !== 'all') {
      query.folder = folder;
    }
    
    if (type) {
      if (type === 'image') {
        query.type = { $regex: /^image\// };
      } else if (type === 'document') {
        query.type = { $regex: /^(application\/pdf|text\/)/ };
      }
    }

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// PATCH /api/files - Update file folder
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    const body = await request.json();
    const { fileId, folder } = body;

    if (!fileId || !folder) {
      return NextResponse.json(
        { error: 'File ID and folder are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const file = await File.findOneAndUpdate(
      { _id: fileId, userId: decoded.userId },
      { folder },
      { new: true }
    );

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}
