import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OTP from '@/models/OTP';
// This route now only verifies OTP and marks it as verified.

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string') {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    const record = await OTP.findOne({ email: normalizedEmail });
    if (!record) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    // Extra expiry guard (TTL will also handle cleanup)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (record.createdAt.getTime() < fiveMinutesAgo) {
      await OTP.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (record.attempts >= 3) {
      await OTP.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'Maximum attempts reached. Please request a new code.' }, { status: 400 });
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      if (record.attempts >= 3) {
        await OTP.deleteOne({ _id: record._id });
        return NextResponse.json({ error: 'Maximum attempts reached. Please request a new code.' }, { status: 400 });
      } else {
        await record.save();
        const attemptsLeft = 3 - record.attempts;
        return NextResponse.json({ error: `Invalid code. ${attemptsLeft} attempt(s) left.` }, { status: 400 });
      }
    }

    // Correct OTP: mark as verified (do not delete yet; signup will consume it)
    record.verified = true;
    await record.save();

    return NextResponse.json({ message: 'OTP verified. Continue to create your password.' }, { status: 200 });
  } catch (error) {
    console.error('verify-otp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
