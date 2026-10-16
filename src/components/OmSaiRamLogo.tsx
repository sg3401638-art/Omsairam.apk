import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'splash';
  variant?: 'full' | 'icon-only' | 'horizontal';
  showTagline?: boolean;
  animated?: boolean;
  className?: string;
  isDark?: boolean;
}

export const OmSaiRamLogo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = true,
  animated = false,
  className = '',
  isDark = false,
}) => {
  // Dimensions mapping
  const iconDimensions = {
    sm: { width: 44, height: 40 },
    md: { width: 72, height: 64 },
    lg: { width: 120, height: 106 },
    xl: { width: 180, height: 160 },
    splash: { width: 240, height: 212 },
  }[size];

  const textSizeClasses = {
    sm: { title: 'text-sm font-extrabold tracking-wider', sub: 'text-[9px] tracking-widest font-bold' },
    md: { title: 'text-lg md:text-xl font-extrabold tracking-wider', sub: 'text-[11px] md:text-xs tracking-widest font-bold' },
    lg: { title: 'text-2xl md:text-3xl font-black tracking-widest', sub: 'text-xs md:text-sm tracking-[0.2em] font-extrabold' },
    xl: { title: 'text-3xl md:text-4xl font-black tracking-widest', sub: 'text-sm md:text-base tracking-[0.25em] font-extrabold' },
    splash: { title: 'text-4xl md:text-5xl font-black tracking-[0.08em]', sub: 'text-base md:text-lg tracking-[0.28em] font-bold' },
  }[size];

  // Unique ID for SVG gradients to prevent DOM collisions
  const gradId = `osr_grad_${size}_${variant}`;

  const LogoIcon = (
    <svg
      width={iconDimensions.width}
      height={iconDimensions.height}
      viewBox="0 0 240 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-lg transition-transform duration-300 ${animated ? 'animate-pulse' : ''}`}
    >
      <defs>
        {/* Crimson Metallic Red Gradient for Battery Case */}
        <linearGradient id={`${gradId}_red`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="75%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        {/* Highlight sheen on top lid */}
        <linearGradient id={`${gradId}_sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#dc2626" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </linearGradient>

        {/* Dark Charcoal Metallic Arrow Gradient */}
        <linearGradient id={`${gradId}_arrow`} x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="45%" stopColor="#334155" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Arrow bevel highlight */}
        <linearGradient id={`${gradId}_arrow_rim`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Glow for lightning */}
        <filter id={`${gradId}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Battery Base Stand / Shadow Platform */}
      <path
        d="M 125 155 L 145 155 L 145 160 L 122 160 Z"
        fill="#1e293b"
        opacity="0.8"
      />
      <rect x="118" y="157" width="28" height="5" rx="1.5" fill="#334155" />

      {/* Main Red Battery Body */}
      <g id="battery_body">
        {/* Main casing */}
        <path
          d="M 68 82 C 68 80 70 78 72 78 L 86 78 L 90 73 L 138 73 L 142 78 L 158 78 C 160 78 162 80 162 82 L 162 148 C 162 151 160 153 157 153 L 73 153 C 70 153 68 151 68 148 Z"
          fill={`url(#${gradId}_red)`}
          stroke="#7f1d1d"
          strokeWidth="2"
        />

        {/* Top Rim Sheen */}
        <path
          d="M 70 82 L 86 82 L 90 75 L 138 75 L 142 82 L 160 82"
          stroke={`url(#${gradId}_sheen)`}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Terminal Posts on Top */}
        {/* Left Terminal (-) */}
        <rect x="75" y="70" width="10" height="8" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        <rect x="77" y="66" width="6" height="4" rx="1" fill="#cbd5e1" />

        {/* Right Terminal (+) */}
        <rect x="145" y="70" width="10" height="8" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        <rect x="147" y="66" width="6" height="4" rx="1" fill="#cbd5e1" />

        {/* Battery Handle / Ribs */}
        <rect x="74" y="98" width="8" height="3" rx="1" fill="#7f1d1d" opacity="0.6" />
        <rect x="74" y="104" width="8" height="3" rx="1" fill="#7f1d1d" opacity="0.6" />

        {/* Battery Charge Gauge on Front */}
        {/* Gauge Outer Shell */}
        <rect
          x="94"
          y="108"
          width="42"
          height="20"
          rx="4"
          fill="#1e293b"
          stroke="#f1f5f9"
          strokeWidth="1.8"
        />
        {/* Battery Nub */}
        <rect x="136" y="113" width="3.5" height="10" rx="1.5" fill="#f1f5f9" />

        {/* 5 Charge Bars */}
        <rect x="98" y="112" width="4.5" height="12" rx="1" fill="#f8fafc" />
        <rect x="105" y="112" width="4.5" height="12" rx="1" fill="#f8fafc" />
        <rect x="112" y="112" width="4.5" height="12" rx="1" fill="#f8fafc" />
        <rect x="119" y="112" width="4.5" height="12" rx="1" fill="#f8fafc" />
        <rect x="126" y="112" width="4.5" height="12" rx="1" fill="#4ade80" />

        {/* Plus Symbol (+) above charge meter */}
        <g transform="translate(144, 98)">
          <path d="M 0 -4 L 0 4 M -4 0 L 4 0" stroke="#fecaca" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        {/* Minus Symbol (-) above left */}
        <g transform="translate(80, 98)">
          <path d="M -4 0 L 4 0" stroke="#fecaca" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </g>

      {/* Crackling Lightning Bolts from top */}
      <g filter={`url(#${gradId}_glow)`}>
        {/* Left Lightning Bolt */}
        <path
          d="M 98 62 L 91 42 L 99 44 L 92 25 L 105 45 L 98 44 Z"
          fill="#ff2d2d"
          stroke="#fee2e2"
          strokeWidth="1.2"
        />
        {/* Center Main Lightning Bolt */}
        <path
          d="M 114 68 L 106 43 L 117 46 L 110 20 L 126 49 L 116 48 Z"
          fill="#ef4444"
          stroke="#fff"
          strokeWidth="1.4"
        />
        {/* Right Lightning Bolt */}
        <path
          d="M 132 64 L 125 45 L 134 47 L 128 30 L 140 50 L 132 48 Z"
          fill="#ff2d2d"
          stroke="#fee2e2"
          strokeWidth="1.2"
        />
      </g>

      {/* Dynamic Swoosh Ascending Arrow circling from base to top right */}
      <g id="swoosh_arrow">
        {/* Shadow behind arrow */}
        <path
          d="M 60 148 C 50 135, 60 110, 80 115 C 65 125, 60 145, 80 160 C 105 178, 140 155, 175 92 L 182 98 L 180 62 L 152 75 L 158 81 C 130 135, 95 162, 60 148 Z"
          fill="#000000"
          opacity="0.35"
        />

        {/* Main 3D Metallic Swoosh Ring */}
        <path
          d="M 64 140 C 52 125, 65 106, 85 112 C 68 122, 64 140, 84 154 C 110 172, 144 148, 172 88 L 178 93 L 177 56 L 146 72 L 153 78 C 128 130, 95 156, 64 140 Z"
          fill={`url(#${gradId}_arrow)`}
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Outer Highlight Ridge */}
        <path
          d="M 62 135 C 53 122, 65 107, 83 113"
          stroke={`url(#${gradId}_arrow_rim)`}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 84 154 C 110 172, 144 148, 172 88"
          stroke={`url(#${gradId}_arrow_rim)`}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Arrowhead crisp tip */}
        <polygon
          points="177,56 186,72 173,74"
          fill="#64748b"
          opacity="0.7"
        />
      </g>
    </svg>
  );

  // If icon-only
  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoIcon}</div>;
  }

  // If horizontal (e.g. for top bar header)
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        <div className="shrink-0">{LogoIcon}</div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-col leading-none">
            <span
              className={`font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg md:text-xl'}`}
              style={{ fontFamily: "'Rajdhani', 'Plus Jakarta Sans', sans-serif" }}
            >
              OM SAI RAM
            </span>
            <span
              className={`font-black tracking-wider ${
                isDark ? 'text-red-400' : 'text-red-700'
              } ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}
              style={{ fontFamily: "'Rajdhani', 'Plus Jakarta Sans', sans-serif" }}
            >
              ELECTRICALS
            </span>
          </div>
          {/* Underline Bar */}
          <div className="w-full h-[2.5px] bg-gradient-to-r from-red-600 via-red-500 to-transparent mt-1 mb-0.5 rounded-full" />
          {showTagline && (
            <span
              className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              POWERING YOUR HOME
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full stacked variant (as seen in the logo image)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      <div className="relative mb-2 flex items-center justify-center">
        {LogoIcon}
      </div>

      {/* Typography from logo */}
      <div className="flex flex-col items-center">
        <h1
          className={`${textSizeClasses.title} ${isDark ? 'text-white' : 'text-slate-900'} leading-none uppercase font-extrabold`}
          style={{ fontFamily: "'Rajdhani', 'Plus Jakarta Sans', sans-serif", letterSpacing: '0.04em' }}
        >
          OM SAI RAM
        </h1>
        <h2
          className={`${textSizeClasses.title} ${isDark ? 'text-slate-100' : 'text-slate-800'} leading-tight tracking-[0.14em] uppercase font-black`}
          style={{ fontFamily: "'Rajdhani', 'Plus Jakarta Sans', sans-serif" }}
        >
          ELECTRICALS
        </h2>

        {/* Precision Red Accent Line */}
        <div className="w-11/12 max-w-[260px] h-[3px] bg-gradient-to-r from-red-800 via-red-600 to-red-800 rounded-full my-1.5 shadow-sm" />

        {showTagline && (
          <p
            className={`${textSizeClasses.sub} uppercase ${isDark ? 'text-slate-300' : 'text-slate-600'} font-bold tracking-[0.24em]`}
          >
            POWERING YOUR HOME
          </p>
        )}
      </div>
    </div>
  );
};
