import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Zap, Users, CheckCircle, Shield, Store, Bell, X } from 'lucide-react';
import { realtimeSync, SyncNotification } from '../services/realtimeSync';

interface LiveSyncStatusProps {
  activeEmployee: string;
  isOwner: boolean;
  onForceSync?: () => void;
}

export const LiveSyncStatus: React.FC<LiveSyncStatusProps> = ({
  activeEmployee,
  isOwner,
  onForceSync,
}) => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<SyncNotification[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isPinging, setIsPinging] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to status updates
    const unsubscribeStatus = realtimeSync.subscribeStatus((newStatus, count) => {
      setStatus(newStatus);
      setOnlineCount(count);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    // Subscribe to incoming remote notifications
    const unsubscribeData = realtimeSync.subscribe((_data, notif) => {
      if (notif) {
        setNotifications((prev) => [notif, ...prev.slice(0, 4)]);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        // Auto remove notification after 4.5 seconds
        setTimeout(() => {
          setNotifications((curr) => curr.filter((n) => n.id !== notif.id));
        }, 4500);
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeData();
    };
  }, []);

  const handleManualSync = async () => {
    setIsPinging(true);
    if (onForceSync) {
      await onForceSync();
    }
    setTimeout(() => {
      setIsPinging(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 500);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {/* 1. Header Live Sync Pill Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-xs cursor-pointer border ${
          status === 'connected'
            ? 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300'
            : status === 'connecting'
            ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-500/50 text-amber-300'
            : 'bg-red-950/70 hover:bg-red-900 border-red-500/50 text-red-300'
        }`}
        title="Live Sync: Real-time synchronization between Staff & Owner"
      >
        <span className="relative flex h-2 w-2">
          {status === 'connected' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status === 'connected'
                ? 'bg-emerald-400'
                : status === 'connecting'
                ? 'bg-amber-400'
                : 'bg-red-400'
            }`}
          ></span>
        </span>
        <span className="hidden sm:inline font-mono">
          {status === 'connected' ? (onlineCount > 1 ? `Live (${onlineCount})` : 'Live Synced') : status === 'connecting' ? 'Connecting...' : 'Offline'}
        </span>
        <span className="sm:hidden font-mono text-[10px]">
          {status === 'connected' ? 'Live' : 'Off'}
        </span>
      </button>

      {/* 2. Floating Live Event Toast Banner (When Staff or Owner updates) */}
      {notifications.length > 0 && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/40 shadow-xl rounded-2xl p-3 flex items-start gap-3 animate-in slide-in-from-top-3 fade-in duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] font-black text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{notif.senderRole}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                </div>
                <p className="text-xs font-semibold text-slate-100 mt-1 line-clamp-2">
                  {notif.description}
                </p>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Synchronized live across all devices</span>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Live Sync Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">Live Store Synchronization</h3>
                  <p className="text-xs text-slate-300 font-medium">Owner &amp; Staff Bi-Directional Bridge</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  status === 'connected'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : status === 'connecting'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {status === 'connected' ? (
                    <Wifi className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="text-xs font-bold">
                      {status === 'connected'
                        ? 'Real-Time Sync Active'
                        : status === 'connecting'
                        ? 'Reconnecting to Live Server...'
                        : 'Offline Mode (Local Cache Active)'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Last synced at <span className="font-mono font-semibold">{lastSyncTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-mono font-bold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>{onlineCount} {onlineCount === 1 ? 'Device' : 'Devices'}</span>
                </div>
              </div>

              {/* How it works explanation */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-red-600" />
                  <span>How Live Sync Works:</span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900">Staff does something:</strong> When staff creates a sale, deducts stock, or enters an Udhar payment, the owner's app updates instantly.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900">Owner does something:</strong> When owner adds a product, edits prices, adds stock purchase, or settles dues, the staff's app updates in real-time.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900">Zero Refresh Required:</strong> Changes stream over WebSocket / Server-Sent Events with instantaneous in-browser BroadcastChannel sync.
                  </div>
                </div>
              </div>

              {/* Current Device Profile */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <Shield className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Store className="w-4 h-4 text-blue-600" />
                  )}
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">This Device Role</span>
                    <span className="font-bold text-slate-900">{activeEmployee}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isOwner ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isOwner ? 'Owner Mode' : 'Staff Mode'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isPinging}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Synchronizing...' : 'Force Sync Store Now'}</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
