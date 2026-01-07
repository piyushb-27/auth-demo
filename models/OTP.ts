import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string; // 6 digit code
  createdAt: Date; // TTL 5 minutes
  attempts: number; // wrong attempts
  verified: boolean;
}

const OTPSchema: Schema<IOTP> = new Schema({
  email: { type: String, required: true, index: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
});

const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
