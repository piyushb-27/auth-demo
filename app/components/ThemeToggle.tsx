'use client';

import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const base = 'fixed bottom-4 right-4 sm:top-4 sm:right-4 sm:bottom-auto z-50 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md shadow-md transition-colors';
  const darkClasses = 'border-neutral-700/50 bg-neutral-900/80 text-white hover:border-white/60 hover:bg-neutral-800/80';
  const lightClasses = 'border-gray-300 bg-white/90 text-black hover:border-gray-400 hover:bg-white';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`${base} ${isDark ? darkClasses : lightClasses}`}
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </motion.button>
  );
}
