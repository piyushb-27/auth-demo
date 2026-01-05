'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../components/ThemeProvider';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-black text-white' : 'bg-white text-gray-900';
  const cardBg = isDark
    ? 'bg-neutral-900 border border-neutral-800'
    : 'bg-white border border-gray-200 shadow-sm';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bg} relative`}>
      <ThemeToggle />
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`border-b ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            disabled={loading}
            className={`px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center space-y-4"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className={`text-6xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Hello World
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`${subtext} text-lg`}
          >
            Welcome to your dashboard
          </motion.p>
        </motion.div>

        {/* Optional: Add some cards or content */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "rgb(64, 64, 64)" }}
            className={`p-6 rounded-lg transition-all ${cardBg}`}
          >
            <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Getting Started</h3>
            <p className={`${subtext} text-sm`}>Welcome to your new dashboard. Start building something amazing.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "rgb(64, 64, 64)" }}
            className={`p-6 rounded-lg transition-all ${cardBg}`}
          >
            <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Profile</h3>
            <p className={`${subtext} text-sm`}>Manage your account settings and preferences here.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "rgb(64, 64, 64)" }}
            className={`p-6 rounded-lg transition-all ${cardBg}`}
          >
            <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Resources</h3>
            <p className={`${subtext} text-sm`}>Access documentation and helpful guides to get the most out of your account.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
