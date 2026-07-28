import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const DarsHubLogo: React.FC<LogoProps> = ({ className = 'w-9 h-9', size }) => {
  const rawId = useId();
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dhGradientId = `dhGrad_${cleanId}`;
  const accentGradientId = `accentGrad_${cleanId}`;

  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      style={style}
    >
      <defs>
        <linearGradient id={dhGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="50%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
        <linearGradient id={accentGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#CCFBF1" />
        </linearGradient>
      </defs>

      {/* Outer Rounded Container with Teal Gradient */}
      <rect width="100" height="100" rx="24" fill={`url(#${dhGradientId})`} />

      {/* Subtle Inner Border Highlight */}
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="21"
        fill="none"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="2"
      />

      {/* Graduation Cap Top Diamond */}
      <polygon points="50,22 82,36 50,50 18,36" fill={`url(#${accentGradientId})`} />

      {/* Cap Neck / Base */}
      <path
        d="M30 43.5V57C30 63.5 39 68.5 50 68.5C61 68.5 70 63.5 70 57V43.5L50 52.5L30 43.5Z"
        fill={`url(#${accentGradientId})`}
        opacity="0.9"
      />

      {/* Book Pages Base / Hub Arc */}
      <path
        d="M22 66C32 62 43 62 50 65C57 62 68 62 78 66V75C68 71 57 71 50 74C43 71 32 71 22 75V66Z"
        fill="#FFFFFF"
        opacity="0.98"
      />

      {/* Tassel Circle & String */}
      <path d="M82 36V54" stroke="#CCFBF1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="82" cy="56" r="3.5" fill="#CCFBF1" />
    </svg>
  );
};
