'use client';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" className="fill-[#F9F8F4] dark:fill-[#1A1F1C]"/>
      
      {/* Inner arch shape */}
      <path 
        d="M20 75 L20 45 Q20 20 50 20 Q80 20 80 45 L80 75" 
        fill="none" 
        className="stroke-[#8C9A84]" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* J letter */}
      <text 
        x="50" 
        y="65" 
        fontFamily="Playfair Display, Georgia, serif" 
        fontSize="42" 
        fontStyle="italic" 
        fontWeight="700" 
        fill="currentColor" 
        textAnchor="middle"
      >
        J
      </text>
      
      {/* Botanical accent - small leaves at bottom */}
      <path d="M35 80 Q40 75 45 80" className="stroke-[#C27B66]" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M55 80 Q60 75 65 80" className="stroke-[#C27B66]" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
