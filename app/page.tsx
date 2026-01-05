"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./components/ThemeProvider";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bg = isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark
    ? "bg-neutral-950/80 border-neutral-800"
    : "bg-white border-gray-200 shadow-sm";
  const subtext = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-4 sm:px-6 relative`}>
      <ThemeToggle />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-3xl border rounded-2xl p-8 sm:p-12 ${cardBg} backdrop-blur`}
      >
        <div className="flex flex-col gap-6 text-center sm:text-left">
          <div>
            <p className={`${subtext} text-sm uppercase tracking-[0.3em]`}>Auth Demo</p>
            <h1 className={`text-3xl sm:text-4xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Light / Dark mode with JWT auth
            </h1>
            <p className={`${subtext} text-base sm:text-lg mt-3`}>
              Simple email/password authentication with MongoDB, JWT cookies, and a modern animated UI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/signup"
              className={`text-center px-5 py-3 rounded-lg font-medium transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'}`}
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className={`text-center px-5 py-3 rounded-lg font-medium border transition-colors ${isDark ? 'border-neutral-800 text-white hover:bg-neutral-900' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
