import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OmSaiRamLogo } from './OmSaiRamLogo';
import { sounds } from '../utils/audio';
import { Zap, ArrowRight, ShieldCheck, Volume2, VolumeX } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  employeeName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, employeeName = 'Employee' }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'charging' | 'spark' | 'unveiled'>('charging');
  const [muted, setMuted] = useState(sounds.getIsMuted());

  useEffect(() => {
    // Initial sound
    const timerAudio = setTimeout(() => {
      sounds.playPowerUp();
    }, 400);

    const sparkTimer = setTimeout(() => {
      sounds.playSpark();
      setStage('spark');
    }, 1100);

    const unveilTimer = setTimeout(() => {
      setStage('unveiled');
    }, 1600);

    // Progress bar ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 60);

    // Auto complete after 3.2s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(timerAudio);
      clearTimeout(sparkTimer);
      clearTimeout(unveilTimer);
      clearTimeout(completeTimer);
      clearInterval(interval);
    };
  }, [onComplete]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = sounds.toggleMute();
    setMuted(newMuted);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Background Animated Electric Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-slate-950 to-slate-950" />
      
      {/* Subtle circuit line patterns */}
      <div 
        className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" 
      />

      {/* Lightning energy pulses in background */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.2,
          ease: 'easeInOut',
        }}
        className="absolute w-[450px] h-[450px] rounded-full bg-red-600/20 blur-[100px] pointer-events-none"
      />

      {/* Top Bar Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs text-slate-400 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Om Sai Ram Electricals • Official Employee Terminal</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-900/30 hover:bg-red-800/50 border border-red-700/50 text-red-200 text-xs font-semibold transition-all group"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Center Logo Presentation */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6">
        {/* Animated Badge Container */}
        <motion.div
          initial={{ scale: 0.6, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 240,
            damping: 18,
            duration: 0.8,
          }}
          className="relative"
        >
          {/* Pulsing electric glow ring around logo */}
          <motion.div
            animate={{
              boxShadow: stage === 'spark' 
                ? '0 0 50px 10px rgba(239, 68, 68, 0.6)' 
                : '0 0 25px 2px rgba(220, 38, 38, 0.25)',
            }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-4 md:p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl flex flex-col items-center"
          >
            {/* The Logo Vector Component matching the uploaded image */}
            <OmSaiRamLogo size="lg" isDark={true} animated={stage === 'charging'} />
          </motion.div>

          {/* Electric Spark bursts */}
          <AnimatePresence>
            {stage === 'spark' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.15 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none"
              >
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500 text-white font-black text-[11px] tracking-wider uppercase shadow-lg shadow-red-500/50 animate-bounce">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>HIGH VOLTAGE INITIALIZED</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Welcome employee text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-red-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>Battery & Electrical Invoicing Portal</span>
          </div>
          <p className="text-slate-300 text-sm">
            Welcome, <span className="text-white font-bold">{employeeName}</span>. Ready for Billing & Price Checks.
          </p>
        </motion.div>

        {/* Dynamic Voltage Progress Bar */}
        <div className="w-64 mt-6">
          <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5 font-mono">
            <span className="flex items-center gap-1 text-red-400">
              <Zap className="w-3 h-3 fill-red-500" />
              <span>Connecting Catalog</span>
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400 shadow-sm shadow-red-500"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Quick Click to Enter Action */}
        <motion.button
          onClick={onComplete}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-700/40 transition-all cursor-pointer"
        >
          <span>Enter Store Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Footer Specs Note */}
      <div className="absolute bottom-5 text-center text-[11px] text-slate-500 font-medium">
        <span>Units: </span>
        <span className="text-slate-400 font-bold">Ah</span> for Batteries •{' '}
        <span className="text-slate-400 font-bold">VA</span> for Inverters •{' '}
        <span className="text-slate-400 font-bold">Watts</span> for Bulbs & Electronics
      </div>
    </motion.div>
  );
};
