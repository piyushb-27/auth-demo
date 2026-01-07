import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded?.userId) return null;
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  return NextResponse.json({
    email: user.email,
    fullName: user.fullName || '',
    mobileNumber: user.mobileNumber || '',
    profilePictureUrl: user.profilePictureUrl || '',
  });
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { fullName = '', mobileNumber = '', profilePictureUrl = '' } = body;

    user.fullName = typeof fullName === 'string' ? fullName.trim() : user.fullName;
    user.mobileNumber = typeof mobileNumber === 'string' ? mobileNumber.trim() : user.mobileNumber;
    user.profilePictureUrl = typeof profilePictureUrl === 'string' ? profilePictureUrl.trim() : user.profilePictureUrl;

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      fullName: user.fullName || '',
      mobileNumber: user.mobileNumber || '',
      profilePictureUrl: user.profilePictureUrl || '',
      email: user.email,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
