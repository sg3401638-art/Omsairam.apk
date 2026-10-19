import React, { useEffect, useState } from 'react';
import { OmSaiRamLogo } from './OmSaiRamLogo';

interface SplashScreenProps {
  onFinish?: () => void;
  autoDismissMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  autoDismissMs = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!autoDismissMs) return;

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, autoDismissMs - 400);

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, autoDismissMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [autoDismissMs, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsFading(true);
        setTimeout(() => {
          setIsVisible(false);
          if (onFinish) onFinish();
        }, 300);
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 bg-black select-none transition-opacity duration-300 cursor-pointer overflow-hidden ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background with Radiant Red Streaks / Laser Beams as in reference screenshot */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Dark Red Gradient */}
        <div className="absolute inset-0 bg-radial from-red-900/40 via-black to-black" />

        {/* Diagonal Light Streaks */}
        <div 
          className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] opacity-40 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse at 40% 50%, rgba(220, 38, 38, 0.45) 0%, rgba(153, 27, 27, 0.2) 35%, transparent 70%)',
          }}
        />

        {/* Diagonal high-speed glowing light beam (top-right to bottom-left) */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(135deg, transparent 35%, rgba(239, 68, 68, 0.25) 45%, rgba(254, 202, 202, 0.4) 50%, rgba(220, 38, 38, 0.25) 55%, transparent 65%)',
          }}
        />

        {/* Opposing light streak */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'linear-gradient(225deg, transparent 40%, rgba(220, 38, 38, 0.2) 48%, rgba(255, 255, 255, 0.15) 50%, rgba(185, 28, 28, 0.2) 52%, transparent 60%)',
          }}
        />
      </div>

      {/* Top spacing */}
      <div className="w-full flex justify-between items-center text-[10px] text-red-500/80 font-mono tracking-widest pt-2 relative z-10">
        <span>OM SAI RAM</span>
        <span>RETAIL TERMINAL</span>
      </div>

      {/* Center Logo Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-sm px-4">
        {/* Glowing backdrop circle */}
        <div className="absolute w-64 h-64 rounded-full bg-red-600/20 blur-3xl pointer-events-none animate-pulse" />

        <div className="transform transition-transform duration-500 scale-105 sm:scale-110">
          <OmSaiRamLogo size="splash" isDark={true} variant="full" />
        </div>
      </div>

      {/* Bottom Loading Spinner & Caption (Exact match to reference screenshot) */}
      <div className="flex flex-col items-center justify-center pb-8 relative z-10">
        {/* Animated Circular Spinner */}
        <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-white animate-spin mb-2.5" />
        <span className="text-sm font-semibold tracking-wider text-slate-200">
          Loading...
        </span>
        <span className="text-[10px] text-slate-500 mt-1">
          Tap anywhere to continue
        </span>
      </div>
    </div>
  );
};
