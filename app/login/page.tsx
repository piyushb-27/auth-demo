'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import BotanicalGradients from '../components/BotanicalGradients';
import { useTheme } from '../components/ThemeProvider';
import { pageVariants, buttonAnimation, transitions } from '@/lib/animations';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/notes');
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
              transition={{ delay: 0.2, ...transitions.normal }}
              className="text-4xl"
            >
              ✦
            </motion.div>
          </div>
        </div>

        {/* Card */}
        <div className={`${isDark ? 'bg-[#242B26]/80' : 'bg-white/80'} backdrop-blur-sm border ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]'} rounded-b-3xl p-8 shadow-lift`}>
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...transitions.normal }}
            className="mb-8 text-center"
          >
            <h1 className={`font-serif text-3xl mb-1 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
              Welcome <em className="italic">back</em>
            </h1>
            <p className={`font-sans text-sm ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
              Sign in to your account
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...transitions.normal }}
              className="space-y-4"
            >
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-transparent border-b-2 ${isDark ? 'border-[#E6E2DA]/50 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#2D3A31] transition-all duration-300 font-sans`}
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
                  className={`w-full px-4 py-3 bg-transparent border-b-2 ${isDark ? 'border-[#E6E2DA]/50 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#2D3A31] transition-all duration-300 font-sans`}
                  placeholder="Password"
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitions.fast}
                className="text-[#C27B66] text-sm px-1 font-sans"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              {...buttonAnimation}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, ...transitions.normal }}
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-full font-sans font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:bg-[#8C9A84]/90' : 'bg-[#2D3A31] text-[#F9F8F4] hover:bg-[#4A5D4E]'}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, ...transitions.normal }}
              className="text-center text-sm pt-2 font-sans"
            >
              <span className={isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}>Don't have an account? </span>
              <Link href="/signup" className={`${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'} hover:underline transition-all font-medium`}>
                Sign up
              </Link>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
