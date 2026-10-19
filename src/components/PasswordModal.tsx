import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OWNER_PASSWORD = '9766208407';

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === OWNER_PASSWORD) {
      setError(false);
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setPassword('');
      setError(false);
    } else if (val === 'DEL') {
      setPassword((prev) => prev.slice(0, -1));
      setError(false);
    } else {
      if (password.length < 15) {
        setPassword((prev) => prev + val);
        setError(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center bg-gradient-to-b from-red-950 via-slate-900 to-slate-900 text-white">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-600/30 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            OWNER ACCESS ONLY
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Staff cannot access the Owner account. Enter the owner security password.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Owner Security Password / PIN:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password..."
                className={`w-full pl-10 pr-10 py-2.5 text-center text-lg font-mono font-bold tracking-widest border-2 rounded-xl focus:outline-none transition-colors ${
                  error
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-400'
                    : 'border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-200">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Incorrect password! Staff are not permitted.</span>
              </div>
            )}
          </div>

          {/* Quick On-Screen Number Keypad for mobile phones */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => handleKeypadPress(btn)}
                className={`py-2 rounded-xl font-mono text-sm font-bold border transition-all active:scale-95 ${
                  btn === 'C'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : btn === 'DEL'
                    ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-700/30 transition-all cursor-pointer"
            >
              Verify &amp; Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
