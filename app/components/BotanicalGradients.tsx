'use client';

import { motion } from 'framer-motion';

export default function BotanicalGradients() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes botanicalFloat1 {
          0% { transform: translateX(0px) translateY(0px) scale(1); }
          33% { transform: translateX(80px) translateY(-40px) scale(1.05); }
          66% { transform: translateX(-40px) translateY(60px) scale(1.02); }
          100% { transform: translateX(0px) translateY(0px) scale(1); }
        }

        @keyframes botanicalFloat2 {
          0% { transform: translateX(0px) translateY(0px) scale(1); }
          33% { transform: translateX(-60px) translateY(50px) scale(1.04); }
          66% { transform: translateX(50px) translateY(-30px) scale(1.03); }
          100% { transform: translateX(0px) translateY(0px) scale(1); }
        }

        @keyframes botanicalFloat3 {
          0% { transform: translateX(0px) translateY(0px) scale(1); }
          50% { transform: translateX(40px) translateY(40px) scale(1.06); }
          100% { transform: translateX(0px) translateY(0px) scale(1); }
        }

        .botanical-blob {
          position: fixed;
          filter: blur(120px);
          opacity: 0.4;
          z-index: 0;
        }

        .dark .botanical-blob {
          opacity: 0.15;
        }

        .botanical-blob1 {
          width: 600px;
          height: 600px;
          top: -15%;
          right: -10%;
          background: radial-gradient(circle, #DCCFC2 0%, #E6E2DA 50%, transparent 70%);
          animation: botanicalFloat1 30s ease-in-out infinite;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }

        .dark .botanical-blob1 {
          background: radial-gradient(circle, #2A3028 0%, #3A423C 50%, transparent 70%);
        }

        .botanical-blob2 {
          width: 500px;
          height: 500px;
          bottom: -10%;
          left: -10%;
          background: radial-gradient(circle, #8C9A84 0%, #DCCFC2 50%, transparent 70%);
          animation: botanicalFloat2 25s ease-in-out infinite;
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }

        .dark .botanical-blob2 {
          background: radial-gradient(circle, #4A5D4E 0%, #2A3028 50%, transparent 70%);
        }

        .botanical-blob3 {
          width: 400px;
          height: 400px;
          top: 40%;
          left: 50%;
          background: radial-gradient(circle, #E6E2DA 0%, #F9F8F4 50%, transparent 70%);
          animation: botanicalFloat3 35s ease-in-out infinite;
          border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%;
        }

        .dark .botanical-blob3 {
          background: radial-gradient(circle, #3A423C 0%, #1A1F1C 50%, transparent 70%);
        }
      `}</style>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="botanical-blob botanical-blob1" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="botanical-blob botanical-blob2" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="botanical-blob botanical-blob3" 
      />
    </div>
  );
}
