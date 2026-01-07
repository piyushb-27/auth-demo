import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OTP from '@/models/OTP';
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!EMAIL_USER || !EMAIL_PASS) {
      return NextResponse.json({ error: 'Email transport not configured' }, { status: 500 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    // Clear any existing OTPs for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Create new OTP
    const code = generateOtp();
    await OTP.create({ email: normalizedEmail, otp: code });

    // Nodemailer Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const subject = 'Your Signup OTP Code';
    const text = `Your OTP is: ${code}. Valid for 5 minutes.`;

    try {
      await transporter.sendMail({
        from: EMAIL_USER,
        to: normalizedEmail,
        subject,
        text,
      });
    } catch (mailError: any) {
      console.error('Nodemailer send error:', mailError?.message || mailError);
      const isDev = process.env.NODE_ENV !== 'production';
      return NextResponse.json({ error: isDev ? `Failed to send OTP: ${mailError?.message || 'unknown error'}` : 'Failed to send OTP' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('send-otp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
