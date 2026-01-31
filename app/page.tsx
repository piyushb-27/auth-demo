"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import BotanicalGradients from "./components/BotanicalGradients";
import { Sparkles } from "lucide-react";
import { pageVariants, buttonAnimation, transitions } from "@/lib/animations";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#1A1F1C] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      <BotanicalGradients />
      <ThemeToggle />
      
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="w-full max-w-3xl relative z-10"
      >
        {/* Decorative arch */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-16 border-t-2 border-l-2 border-r-2 border-[#8C9A84]/30 dark:border-[#8C9A84]/20 rounded-t-full" />
        
        <div className="bg-white/80 dark:bg-[#242B26]/80 backdrop-blur-sm border border-[#E6E2DA] dark:border-[#4A5D4E]/30 rounded-3xl p-8 sm:p-12 shadow-paper">
          <div className="flex flex-col gap-8 text-center">
            {/* Icon */}
            <motion.div 
              className="mx-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, ...transitions.normal }}
            >
              <div className="w-16 h-16 rounded-full bg-[#8C9A84]/20 dark:bg-[#8C9A84]/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#2D3A31] dark:text-[#8C9A84]" />
              </div>
            </motion.div>
            
            <div>
              <motion.p 
                className="text-[#8C9A84] dark:text-[#8C9A84]/80 text-sm uppercase tracking-[0.3em] font-sans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, ...transitions.normal }}
              >
                Welcome to Jot
              </motion.p>
              <motion.h1 
                className="text-3xl sm:text-4xl font-serif font-semibold mt-3 text-[#2D3A31] dark:text-[#F9F8F4]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ...transitions.normal }}
              >
                Capture your thoughts
              </motion.h1>
              <motion.p 
                className="text-[#4A5D4E] dark:text-[#E6E2DA]/70 text-base sm:text-lg mt-4 font-sans max-w-xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, ...transitions.normal }}
              >
                A calm, focused space for your ideas. 
                Write notes, organize them, and keep everything in one place.
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, ...transitions.normal }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-sans font-medium bg-[#2D3A31] dark:bg-[#8C9A84] text-white dark:text-[#1A1F1C] hover:bg-[#4A5D4E] dark:hover:bg-[#8C9A84]/90 transition-all duration-300 shadow-soft hover:shadow-lift"
              >
                <Sparkles className="w-4 h-4" />
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-sans font-medium border-2 border-[#8C9A84]/40 dark:border-[#8C9A84]/30 text-[#2D3A31] dark:text-[#8C9A84] hover:bg-[#8C9A84]/10 dark:hover:bg-[#8C9A84]/5 transition-all duration-300"
              >
                Sign in
              </Link>
            </motion.div>

            {/* Decorative bottom element */}
            <motion.div 
              className="flex items-center justify-center gap-2 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, ...transitions.normal }}
            >
              <div className="w-12 h-px bg-[#DCCFC2] dark:bg-[#4A5D4E]/50" />
              <span className="text-[#8C9A84]/60 dark:text-[#8C9A84]/40 text-xs font-sans">✦</span>
              <div className="w-12 h-px bg-[#DCCFC2] dark:bg-[#4A5D4E]/50" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
