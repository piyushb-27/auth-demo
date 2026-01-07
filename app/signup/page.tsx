'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import FloatingGradients from '../components/FloatingGradients';
import { useTheme } from '../components/ThemeProvider';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
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
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Get started with your account</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:scale-[1.02] focus:border-neutral-700 transition-all duration-200 ${inputStyles}`}
                placeholder="Password"
              />
              <p className="mt-2 text-xs text-gray-500 px-1">
                Password must be at least 6 characters
              </p>
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
            {loading ? 'Creating account...' : 'Sign up'}
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
        </form>
      </motion.div>
    </div>
  );
}
