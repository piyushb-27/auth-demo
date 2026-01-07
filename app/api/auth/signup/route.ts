import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName = '', mobileNumber = '' } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Ensure OTP was verified for this email and not expired
    const otpRecord = await OTP.findOne({ email: email.toLowerCase().trim() });
    if (!otpRecord || !otpRecord.verified) {
      return NextResponse.json(
        { error: 'Email not verified. Please verify OTP first.' },
        { status: 400 }
      );
    }

    // Extra guard for TTL expiry (cleanup handled by index too)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (otpRecord.createdAt.getTime() < fiveMinutesAgo) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: 'OTP expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      mobileNumber,
    });

    // Consume OTP (delete after successful signup)
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json(
      { message: 'User created successfully', email: user.email },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
