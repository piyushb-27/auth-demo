'use client';

import { motion } from 'framer-motion';

export default function FloatingGradients() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes float1 {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg) scale(1); }
          15% { transform: translateX(120px) translateY(-60px) rotate(45deg) scale(1.05); }
          30% { transform: translateX(80px) translateY(100px) rotate(90deg) scale(1.08); }
          45% { transform: translateX(-50px) translateY(120px) rotate(180deg) scale(1.05); }
          60% { transform: translateX(-120px) translateY(40px) rotate(225deg) scale(1.03); }
          75% { transform: translateX(-80px) translateY(-80px) rotate(315deg) scale(1.06); }
          100% { transform: translateX(0px) translateY(0px) rotate(360deg) scale(1); }
        }

        @keyframes float2 {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg) scale(1); }
          20% { transform: translateX(-100px) translateY(80px) rotate(60deg) scale(1.04); }
          40% { transform: translateX(-150px) translateY(-60px) rotate(120deg) scale(1.07); }
          60% { transform: translateX(80px) translateY(-100px) rotate(240deg) scale(1.05); }
          80% { transform: translateX(120px) translateY(50px) rotate(300deg) scale(1.04); }
          100% { transform: translateX(0px) translateY(0px) rotate(360deg) scale(1); }
        }

        @keyframes float3 {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg) scale(1); }
          12% { transform: translateX(100px) translateY(-120px) rotate(30deg) scale(1.06); }
          25% { transform: translateX(140px) translateY(80px) rotate(90deg) scale(1.08); }
          37% { transform: translateX(-80px) translateY(140px) rotate(150deg) scale(1.07); }
          50% { transform: translateX(-140px) translateY(-100px) rotate(180deg) scale(1.05); }
          62% { transform: translateX(-60px) translateY(-140px) rotate(240deg) scale(1.06); }
          75% { transform: translateX(90px) translateY(-60px) rotate(300deg) scale(1.07); }
          100% { transform: translateX(0px) translateY(0px) rotate(360deg) scale(1); }
        }

        @keyframes float4 {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg) scale(1); }
          18% { transform: translateX(-110px) translateY(-90px) rotate(50deg) scale(1.05); }
          36% { transform: translateX(70px) translateY(-110px) rotate(120deg) scale(1.06); }
          54% { transform: translateX(130px) translateY(70px) rotate(220deg) scale(1.04); }
          72% { transform: translateX(-90px) translateY(120px) rotate(300deg) scale(1.07); }
          100% { transform: translateX(0px) translateY(0px) rotate(360deg) scale(1); }
        }

        @keyframes colorShift1 {
          0% { background-image: linear-gradient(135deg, #a855f7, #3b82f6); }
          20% { background-image: linear-gradient(135deg, #3b82f6, #0ea5e9); }
          40% { background-image: linear-gradient(135deg, #0ea5e9, #06b6d4); }
          60% { background-image: linear-gradient(135deg, #06b6d4, #a855f7); }
          80% { background-image: linear-gradient(135deg, #8b5cf6, #3b82f6); }
          100% { background-image: linear-gradient(135deg, #a855f7, #3b82f6); }
        }

        @keyframes colorShift2 {
          0% { background-image: linear-gradient(135deg, #ec4899, #f97316); }
          20% { background-image: linear-gradient(135deg, #f97316, #eab308); }
          40% { background-image: linear-gradient(135deg, #eab308, #fbbf24); }
          60% { background-image: linear-gradient(135deg, #fbbf24, #ec4899); }
          80% { background-image: linear-gradient(135deg, #f43f5e, #f97316); }
          100% { background-image: linear-gradient(135deg, #ec4899, #f97316); }
        }

        @keyframes colorShift3 {
          0% { background-image: linear-gradient(135deg, #06b6d4, #a855f7); }
          20% { background-image: linear-gradient(135deg, #a855f7, #ec4899); }
          40% { background-image: linear-gradient(135deg, #ec4899, #f43f5e); }
          60% { background-image: linear-gradient(135deg, #f43f5e, #0ea5e9); }
          80% { background-image: linear-gradient(135deg, #0ea5e9, #a855f7); }
          100% { background-image: linear-gradient(135deg, #06b6d4, #a855f7); }
        }

        @keyframes colorShift4 {
          0% { background-image: linear-gradient(135deg, #10b981, #06b6d4); }
          20% { background-image: linear-gradient(135deg, #06b6d4, #3b82f6); }
          40% { background-image: linear-gradient(135deg, #3b82f6, #8b5cf6); }
          60% { background-image: linear-gradient(135deg, #8b5cf6, #10b981); }
          80% { background-image: linear-gradient(135deg, #14b8a6, #06b6d4); }
          100% { background-image: linear-gradient(135deg, #10b981, #06b6d4); }
        }

        .blob {
          position: fixed;
          filter: blur(80px);
          opacity: 0.4;
          z-index: 0;
        }

        .blob1 {
          width: 500px;
          height: 500px;
          top: -10%;
          right: -5%;
          animation: float1 15s ease-in-out infinite, colorShift1 12s ease-in-out infinite;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          will-change: transform;
        }

        .blob2 {
          width: 400px;
          height: 400px;
          bottom: 5%;
          left: 5%;
          animation: float2 20s ease-in-out infinite, colorShift2 10s ease-in-out infinite;
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          will-change: transform;
        }

        .blob3 {
          width: 350px;
          height: 350px;
          top: 40%;
          left: -50px;
          animation: float3 25s ease-in-out infinite, colorShift3 14s ease-in-out infinite;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          will-change: transform;
        }

        .blob4 {
          width: 300px;
          height: 300px;
          bottom: 20%;
          right: 5%;
          animation: float4 18s ease-in-out infinite, colorShift4 11s ease-in-out infinite;
          border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
          will-change: transform;
        }
      `}</style>

      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="blob blob4" />
    </div>
  );
}
