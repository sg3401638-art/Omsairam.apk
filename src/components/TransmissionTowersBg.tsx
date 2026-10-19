import React from 'react';

export const TransmissionTowersBg: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 800 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.14] ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="towerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* High-Voltage Power Lines (Catenary Curves across the sky) */}
      <path
        d="M -50 80 Q 200 130, 400 100 T 850 70"
        stroke="#334155"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M -50 110 Q 180 160, 420 120 T 850 95"
        stroke="#475569"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M -50 140 Q 220 190, 410 140 T 850 120"
        stroke="#64748b"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M -50 170 Q 210 220, 390 170 T 850 150"
        stroke="#64748b"
        strokeWidth="0.8"
        fill="none"
      />

      {/* Left Transmission Pylon Tower */}
      <g transform="translate(60, 40)" stroke="#334155" strokeWidth="1.2" fill="none">
        {/* Main Pylon Mast */}
        <line x1="80" y1="20" x2="40" y2="280" />
        <line x1="80" y1="20" x2="120" y2="280" />
        {/* Crossarms */}
        <line x1="30" y1="60" x2="130" y2="60" strokeWidth="1.6" />
        <line x1="20" y1="100" x2="140" y2="100" strokeWidth="1.8" />
        <line x1="35" y1="140" x2="125" y2="140" strokeWidth="1.6" />
        {/* Bracing Lattice */}
        <line x1="45" y1="60" x2="115" y2="100" />
        <line x1="115" y1="60" x2="45" y2="100" />
        <line x1="50" y1="100" x2="110" y2="140" />
        <line x1="110" y1="100" x2="50" y2="140" />
        <line x1="55" y1="140" x2="105" y2="190" />
        <line x1="105" y1="140" x2="55" y2="190" />
        <line x1="50" y1="190" x2="110" y2="240" />
        <line x1="110" y1="190" x2="50" y2="240" />
        {/* Peak tip */}
        <line x1="80" y1="0" x2="80" y2="20" strokeWidth="1.5" />
      </g>

      {/* Right Transmission Pylon Tower */}
      <g transform="translate(620, 30)" stroke="#334155" strokeWidth="1.2" fill="none">
        {/* Main Pylon Mast */}
        <line x1="80" y1="20" x2="40" y2="290" />
        <line x1="80" y1="20" x2="120" y2="290" />
        {/* Crossarms */}
        <line x1="30" y1="60" x2="130" y2="60" strokeWidth="1.6" />
        <line x1="18" y1="100" x2="142" y2="100" strokeWidth="1.8" />
        <line x1="35" y1="140" x2="125" y2="140" strokeWidth="1.6" />
        {/* Bracing Lattice */}
        <line x1="45" y1="60" x2="115" y2="100" />
        <line x1="115" y1="60" x2="45" y2="100" />
        <line x1="50" y1="100" x2="110" y2="140" />
        <line x1="110" y1="100" x2="50" y2="140" />
        <line x1="55" y1="140" x2="105" y2="190" />
        <line x1="105" y1="140" x2="55" y2="190" />
        <line x1="48" y1="190" x2="112" y2="250" />
        <line x1="112" y1="190" x2="48" y2="250" />
        {/* Peak tip */}
        <line x1="80" y1="0" x2="80" y2="20" strokeWidth="1.5" />
      </g>

      {/* Distant horizon silhouettes */}
      <line x1="-50" y1="310" x2="850" y2="310" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
};
