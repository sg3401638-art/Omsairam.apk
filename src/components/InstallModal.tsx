import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { OmSaiRamLogo } from './OmSaiRamLogo';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle2, 
  Share2, 
  QrCode, 
  WifiOff, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/30 border border-red-500/40 text-red-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                INSTALL OMSAIRAM ON ANDROID PHONE
              </h2>
              <p className="text-[11px] text-slate-300">
                Official Employee Mobile APK &amp; PWA Application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* App Card Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              src="/pwa-192x192.png"
              alt="Om Sai Ram App Icon"
              className="w-16 h-16 rounded-2xl shadow-md border border-slate-200 shrink-0"
              onError={(e) => {
                // Fallback to SVG if png not loaded
                (e.target as HTMLImageElement).src = '/icon.svg';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-slate-900 text-sm">Om Sai Ram Electricals</h3>
              <p className="text-xs text-slate-500">Employee Billing &amp; Price Terminal</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                  Android APK Ready
                </span>
                <span className="text-[10px] font-bold text-slate-500">v2.4 • Offline Capable</span>
              </div>
            </div>
          </div>

          {/* If 1-Click Install is ready in Chrome / Android Browser */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your device supports instant 1-Click APK installation!</span>
              </div>
              <button
                onClick={handleNativeInstall}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Install Omsairam App Now</span>
              </button>
            </div>
          )}

          {/* Quick Steps for Android Employees */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-600" />
              <span>How Employees Install on Android Phone:</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900">Open in Chrome on Phone:</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Open this app link in Google Chrome or any Android browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900">Tap Browser Menu (3 Dots ⋮):</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tap the 3 dots in the top right corner of Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900">Tap "Install App" or "Add to Home Screen":</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Android automatically generates a native WebAPK with the red battery logo and full-screen terminal experience!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share App Link / QR Code to Employees */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Send Link to Employee WhatsApp:
              </span>
              <span className="text-[10px] text-red-400 font-semibold">Instant Access</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Standalone APK Package generation note */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Standalone APK File (Omsairam.apk):</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This app is 100% PWA &amp; WebAPK certified. You can also package it into a raw signed <code className="font-mono font-bold bg-amber-100 px-1 rounded">Omsairam.apk</code> binary using <strong>PWABuilder.com</strong> by pasting your app URL.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const { isInstalled } = usePWAInstall();

  return (
    <button
      onClick={onOpenModal}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer group"
      title="Install Mobile App / Download APK"
    >
      <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      <span>Install App / APK</span>
      {isInstalled && (
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
      )}
    </button>
  );
};

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode Active — You can continue viewing prices &amp; billing without internet.</span>
    </div>
  );
};
