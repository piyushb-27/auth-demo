import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/notes - Get all notes for logged-in user
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT and get userId
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query params
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');

    // Build query
    const query: any = { userId };
    
    if (folder) {
      query.folder = folder;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch notes: pinned first, then by updatedAt descending
    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({ notes }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  console.log('=== CREATE NOTE API CALLED ===');
  
  try {
    // Check JWT token
    const token = request.cookies.get('token')?.value;
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.log('ERROR: No token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT and get userId
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('Decoded user:', decoded);
      userId = decoded.userId;
    } catch (error: any) {
      console.log('ERROR: Token verification failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('Database connecting...');
    await connectDB();
    console.log('Database connected');

    // Get request body
    const body = await request.json();
    console.log('Request body:', body);
    const { title, content, tags, folder } = body;

    // Create new note
    console.log('Creating note with userId:', userId);
    const newNote = await Note.create({
      userId,
      title: title || 'Untitled Note',
      content: content || '',
      tags: tags || [],
      folder: folder || 'General',
    });
    console.log('Note created successfully:', newNote._id);

    return NextResponse.json(
      { message: 'Note created successfully', note: newNote },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('CREATE NOTE ERROR:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create note', details: error.message },
      { status: 500 }
    );
  }
}
