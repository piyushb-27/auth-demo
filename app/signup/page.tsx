'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import BotanicalGradients from '../components/BotanicalGradients';
import { useTheme } from '../components/ThemeProvider';
import { pageVariants, buttonAnimation, transitions } from '@/lib/animations';

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
      router.push('/profile');
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 relative ${isDark ? 'bg-[#1A1F1C]' : 'bg-alabaster'}`}>
      <BotanicalGradients />
      <ThemeToggle />
      
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className={`w-full max-w-sm relative z-10`}
      >
        {/* Decorative Arch */}
        <div className={`h-24 rounded-t-[100px] mb-[-1px] ${isDark ? 'bg-[#242B26]' : 'bg-[#DCCFC2]/40'}`}>
          <div className="h-full w-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, ...transitions.normal }}
              className="text-4xl"
            >
              ✦
            </motion.div>
          </div>
        </div>

        {/* Card */}
        <div className={`${isDark ? 'bg-[#242B26]/80' : 'bg-white/80'} backdrop-blur-sm border ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]'} rounded-b-3xl p-8 shadow-lift`}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, ...transitions.normal }}
            className="mb-8 text-center"
          >
            <h1 className={`font-serif text-3xl mb-1 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
              Create your <em className="italic">account</em>
            </h1>
            <p className={`font-sans text-sm ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
              Get started in just a few steps
            </p>
            
            {/* Step indicators */}
            <div className="mt-4 flex items-center justify-center gap-3 text-xs font-sans">
              <span className={`inline-flex h-7 items-center rounded-full px-3 transition-all duration-300 ${step !== 'complete' ? (isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-[#2D3A31] text-[#F9F8F4]') : (isDark ? 'bg-transparent text-[#8C9A84] border border-[#E6E2DA]/30' : 'bg-transparent text-[#8C9A84] border border-[#E6E2DA]')}`}>
                1. Verify
              </span>
              <span className={`${isDark ? 'text-[#E6E2DA]/50' : 'text-[#E6E2DA]'}`}>→</span>
              <span className={`inline-flex h-7 items-center rounded-full px-3 transition-all duration-300 ${step === 'complete' ? (isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-[#2D3A31] text-[#F9F8F4]') : (isDark ? 'bg-transparent text-[#8C9A84] border border-[#E6E2DA]/30' : 'bg-transparent text-[#8C9A84] border border-[#E6E2DA]')}`}>
                2. Create
              </span>
            </div>
          </motion.div>

          {/* Step content */}
          {step === 'email' && (
            <div className="space-y-5">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, ...transitions.normal }}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-transparent border-b-2 ${isDark ? 'border-[#E6E2DA]/50 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#2D3A31] transition-colors duration-300 font-sans`}
                  placeholder="Email"
                />
              </motion.div>

              {otpError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transitions.fast} className="text-[#C27B66] text-sm px-1 font-sans">{otpError}</motion.div>
              )}
              {otpMessage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transitions.fast} className="text-[#8C9A84] text-sm px-1 font-sans">{otpMessage}</motion.div>
              )}

              <motion.button
                {...buttonAnimation}
                onClick={sendOtp}
                disabled={otpLoading || !email}
                className={`w-full py-3.5 rounded-full font-sans font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:bg-[#8C9A84]/90' : 'bg-[#2D3A31] text-[#F9F8F4] hover:bg-[#4A5D4E]'}`}
              >
                {otpLoading ? 'Sending...' : 'Send OTP'}
              </motion.button>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, ...transitions.normal }}
                className="text-center text-sm pt-2 font-sans"
              >
                <span className={isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}>Already have an account? </span>
                <Link href="/login" className={`${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'} hover:underline transition-all font-medium`}>
                  Sign in
                </Link>
              </motion.div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-5">
              <div className={`${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} text-sm font-sans text-center`}>
                We sent a 6-digit code to <span className={isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}>{email}</span>
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
                  className={`w-full px-4 py-3 bg-transparent border-b-2 ${isDark ? 'border-[#E6E2DA]/50 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#2D3A31] transition-colors duration-300 font-sans tracking-[0.5em] text-center text-lg`}
                  placeholder="000000"
                />
              </div>
              <div className="flex items-center justify-between text-sm px-1 font-sans">
                <span className={isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}>
                  {secondsLeft > 0 ? `Expires in ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}` : 'Code expired'}
                </span>
                {secondsLeft === 0 ? (
                  <button onClick={() => { setOtp(''); setSecondsLeft(300); sendOtp(); }} className={`${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'} hover:underline font-medium`}>
                    Resend
                  </button>
                ) : (
                  <button disabled className={isDark ? 'text-[#E6E2DA]/50' : 'text-[#E6E2DA]'}>Resend</button>
                )}
              </div>

              {otpError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transitions.fast} className="text-[#C27B66] text-sm px-1 font-sans">{otpError}</motion.div>
              )}

              <motion.button
                {...buttonAnimation}
                onClick={verifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className={`w-full py-3.5 rounded-full font-sans font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:bg-[#8C9A84]/90' : 'bg-[#2D3A31] text-[#F9F8F4] hover:bg-[#4A5D4E]'}`}
              >
                {otpLoading ? 'Verifying...' : 'Verify OTP'}
              </motion.button>
            </div>
          )}

          {step === 'complete' && (
            <form onSubmit={completeSignup} className="space-y-5">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, ...transitions.normal }}
                className="space-y-4"
              >
                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-transparent border-b-2 ${isDark ? 'border-[#E6E2DA]/50 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#2D3A31] transition-colors duration-300 font-sans`}
                    placeholder="Create password"
                  />
                  <p className="mt-2 text-xs text-[#8C9A84] px-1 font-sans">Minimum 6 characters</p>
                </div>
                <div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-transparent border-b-2 ${isDark ? 'border-[#E6E2DA]/50 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#2D3A31] transition-colors duration-300 font-sans`}
                    placeholder="Confirm password"
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.fast}
                  className="text-[#C27B66] text-sm px-1 font-sans"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                {...buttonAnimation}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, ...transitions.normal }}
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-full font-sans font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:bg-[#8C9A84]/90' : 'bg-[#2D3A31] text-[#F9F8F4] hover:bg-[#4A5D4E]'}`}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
