import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle2, 
  Share2, 
  WifiOff, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Check,
  FileArchive,
  ArrowRight,
  Info,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'bundle'>('apk');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const primaryRepo = 'sg3401638-art/Omsairam.apk';
  const altRepo = 'sg3401638-art/Omsairam';
  
  const latestApkUrl = `https://github.com/${primaryRepo}/releases/latest/download/Omsairam.apk`;
  const releasesPageUrl = `https://github.com/${primaryRepo}/releases`;
  const githubActionsUrl = `https://github.com/${primaryRepo}/actions`;
  const workflowRunUrl = `https://github.com/${primaryRepo}/actions/workflows/build-apk.yml`;
  
  const altLatestApkUrl = `https://github.com/${altRepo}/releases/latest/download/Omsairam.apk`;
  const altReleasesPageUrl = `https://github.com/${altRepo}/releases`;

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

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Om Sai Ram Electricals - Official Mobile App & APK Download:\n${currentUrl}\n\nDownload Latest APK directly:\n${latestApkUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/30 border border-red-500/40 text-red-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                DOWNLOAD OM SAI RAM APP &amp; APK
              </h2>
              <p className="text-[11px] text-slate-300">
                Official Android APK (Omsairam.apk), 1-Click Mobile App &amp; Offline Bundle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-b-2 border-red-600 text-red-700 font-extrabold bg-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>Download APK</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-red-100 text-red-700">Latest</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-b-2 border-red-600 text-red-700 font-extrabold bg-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>1-Click Phone Install</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-700">No APK Needed</span>
          </button>

          <button
            onClick={() => setActiveTab('bundle')}
            className={`pb-2.5 px-3 rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bundle'
                ? 'border-b-2 border-red-600 text-red-700 font-extrabold bg-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileArchive className="w-4 h-4 text-blue-600" />
            <span>Offline Zip</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* App Card Info */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              src="/icon.svg"
              alt="Om Sai Ram App Icon"
              className="w-13 h-13 rounded-2xl shadow-sm border border-slate-200 shrink-0 p-1 bg-white"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-slate-900 text-sm">Om Sai Ram Electricals</h3>
              <p className="text-[11px] text-slate-500 truncate">Battery, Inverter &amp; Electronics Staff Billing Terminal</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                  Android APK Ready
                </span>
                <span className="text-[10px] font-bold text-slate-500">v2.5 • Live Sync</span>
              </div>
            </div>
          </div>

          {/* TAB 1: APK DOWNLOAD */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Primary Download APK Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white font-mono">
                      Target APK: Omsairam.apk
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">
                      Download Latest Android APK Package
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Direct link to GitHub Release build created by repository workflow.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                    <Download className="w-6 h-6 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <a
                    href={latestApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-700/30 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Omsairam.apk (Latest)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={releasesPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all"
                    >
                      <span>All GitHub Releases</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>

                    <a
                      href={githubActionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all"
                    >
                      <span>GitHub Actions Builds</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step-by-Step APK Installation Instructions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-red-600" />
                  <span>How to Install Omsairam.apk on Android:</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900">Download the APK:</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Click the red button above. Chrome will download <code className="font-mono font-bold text-red-700 bg-red-50 px-1 rounded">Omsairam.apk</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900">Allow "Install Unknown Apps":</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        If Android shows "File might be harmful" or "For your security, phone is not allowed to install unknown apps", tap <strong>Settings</strong> &rarr; Toggle <strong>Allow from this source</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900">Tap "Install" &amp; Launch:</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Tap Install. The official Om Sai Ram Electricals app will appear on your phone's home screen with the red battery logo!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK PHONE INSTALL (NO APK NEEDED) */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono">
                      Fastest &amp; Safest
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">
                      1-Click Instant App Install (WebAPK)
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Installs directly into Android OS without downloading separate files or security warnings.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>

                {isInstallable ? (
                  <button
                    onClick={handleNativeInstall}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on Phone Now</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>In Chrome on your Phone:</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Tap the <strong>3 dots (⋮)</strong> at top-right of your mobile browser &rarr; Tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Benefits Card */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Works Offline</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Check prices and battery Ah even with zero network.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Synced</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Staff sales instantly sync with Owner dashboard.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE ZIP BUNDLE */}
          {activeTab === 'bundle' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono">
                      Offline Package
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">
                      Download Full Web App Bundle (.zip)
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Contains complete compiled production assets, HTML, JavaScript &amp; CSS for offline use.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                    <FileArchive className="w-6 h-6" />
                  </div>
                </div>

                <a
                  href="/Omsairam-App-Bundle.zip"
                  download="Omsairam-App-Bundle.zip"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-700/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Omsairam-App-Bundle.zip</span>
                </a>
              </div>
            </div>
          )}

          {/* Share App Link / WhatsApp */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Send to Store Employees:
              </span>
              <button
                onClick={handleShareWhatsApp}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Repository: <code className="font-bold text-slate-700">{primaryRepo}</code>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ onOpenModal: () => void; className?: string }> = ({ onOpenModal, className }) => {
  const { isInstalled } = usePWAInstall();

  return (
    <button
      onClick={onOpenModal}
      className={className || "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer group"}
      title="Download Latest Android APK / Install App"
    >
      <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      <span>Download App / APK</span>
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
