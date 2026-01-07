'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import FloatingGradients from '../components/FloatingGradients';
import { useTheme } from '../components/ThemeProvider';

export default function SignupPage() {
  const [step, setStep] = useState<'email' | 'verify' | 'complete'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerBg = isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = isDark ? 'bg-neutral-950/40 border border-neutral-800' : 'bg-white/60 border border-gray-200 shadow-sm';
  const inputStyles = isDark
    ? 'bg-neutral-900 border border-neutral-800 text-white placeholder-gray-500'
    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500';
  const buttonStyles = isDark
    ? 'bg-white text-black hover:bg-gray-100'
    : 'bg-black text-white hover:bg-gray-900';

  // countdown timer for OTP
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const sendOtp = async () => {
    setOtpError('');
    setOtpMessage('');
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Failed to send OTP');
        return;
      }
      setOtpMessage('OTP sent to your email');
      setSecondsLeft(300);
      setStep('verify');
    } catch (e) {
      setOtpError('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Invalid or expired OTP');
        return;
      }
      setStep('complete');
    } catch (e) {
      setOtpError('Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const completeSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 ${containerBg} relative`}>
      <FloatingGradients />
      <ThemeToggle />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-sm rounded-xl border ${cardBg} p-6 sm:p-8 backdrop-blur`}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className={`text-2xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create account</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Secure your account with email verification</p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-6 items-center rounded-full px-2 ${step !== 'complete' ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : (isDark ? 'bg-transparent text-gray-400 border border-neutral-800' : 'bg-transparent text-gray-600 border border-gray-300')}`}>1. Verify Email</span>
              <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>→</span>
              <span className={`inline-flex h-6 items-center rounded-full px-2 ${step === 'complete' ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : (isDark ? 'bg-transparent text-gray-400 border border-neutral-800' : 'bg-transparent text-gray-600 border border-gray-300')}`}>2. Create Password</span>
            </div>
          </div>
        </motion.div>
        {/* Step content */}
        {step === 'email' && (
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:scale-[1.02] focus:border-neutral-700 transition-all duration-200 ${inputStyles}`}
                  placeholder="Email"
                />
              </div>
            </motion.div>

            {otpError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm px-1">{otpError}</motion.div>
            )}
            {otpMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 text-sm px-1">{otpMessage}</motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendOtp}
              disabled={otpLoading || !email}
              className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles}`}
            >
              {otpLoading ? 'Sending...' : 'Send OTP'}
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center text-sm pt-2"
            >
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Already have an account? </span>
              <Link href="/login" className={isDark ? 'text-white hover:underline transition-all' : 'text-black hover:underline transition-all'}>
                Sign in
              </Link>
            </motion.div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
              We sent a 6-digit code to <span className={isDark ? 'text-white' : 'text-black'}>{email}</span>
            </div>
            <div>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:scale-[1.02] focus:border-neutral-700 transition-all duration-200 ${inputStyles} tracking-widest text-center`}
                placeholder="Enter 6-digit code"
              />
            </div>
            <div className="flex items-center justify-between text-sm px-1">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {secondsLeft > 0 ? `Expires in ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}` : 'Code expired'}
              </span>
              {secondsLeft === 0 ? (
                <button onClick={() => { setOtp(''); setSecondsLeft(300); sendOtp(); }} className={isDark ? 'text-white hover:underline' : 'text-black hover:underline'}>
                  Resend OTP
                </button>
              ) : (
                <button disabled className={isDark ? 'text-gray-600' : 'text-gray-400'}>Resend OTP</button>
              )}
            </div>

            {otpError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm px-1">{otpError}</motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={verifyOtp}
              disabled={otpLoading || otp.length !== 6}
              className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles}`}
            >
              {otpLoading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>
          </div>
        )}

        {step === 'complete' && (
          <form onSubmit={completeSignup} className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-3"
            >
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:scale-[1.02] focus:border-neutral-700 transition-all duration-200 ${inputStyles}`}
                  placeholder="Create password"
                />
                <p className="mt-2 text-xs text-gray-500 px-1">Minimum 6 characters</p>
              </div>
              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:scale-[1.02] focus:border-neutral-700 transition-all duration-200 ${inputStyles}`}
                  placeholder="Confirm password"
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-500 text-sm px-1"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles}`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
