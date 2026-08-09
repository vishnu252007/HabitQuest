import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Shield, CheckCircle, ArrowRight } from 'lucide-react';

interface GoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => void;
}

const SAVED_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Vishnu Kumar',
    email: 'vishnu252007@gmail.com',
    avatar: 'V',
  },
  {
    name: 'Alex Gamer',
    email: 'alex.habitquest@gmail.com',
    avatar: 'A',
  },
];

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
}: GoogleAuthModalProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (email: string, name: string) => {
    setSelectedAccountEmail(email);
    setIsAuthenticating(true);

    setTimeout(() => {
      onSelectAccount(email, name);
      setIsAuthenticating(false);
      onClose();
    }, 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    const inferredName = customName || customEmail.split('@')[0].replace('.', ' ');
    handleSelect(customEmail, inferredName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative"
        >
          {/* Top Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sign in with Google</h3>
                <p className="text-[11px] text-slate-500 font-medium">to continue to <span className="font-bold text-rose-600">HabitQuest</span></p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isAuthenticating}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading State Overlay */}
          {isAuthenticating && (
            <div className="p-8 text-center space-y-4 bg-white">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Authenticating with Google...</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">{selectedAccountEmail}</p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 font-bold bg-emerald-50 py-1.5 px-3 rounded-full w-fit mx-auto">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>OAuth 2.0 Token Verified</span>
              </div>
            </div>
          )}

          {/* Account Selection */}
          {!isAuthenticating && (
            <div className="p-6 space-y-5">
              {!showCustomInput ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Choose an Account
                    </span>

                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
                      {SAVED_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.email}
                          onClick={() => handleSelect(acc.email, acc.name)}
                          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                              {acc.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{acc.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{acc.email}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full py-3 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-slate-500" />
                    <span>Use another Google account</span>
                  </button>
                </>
              ) : (
                /* Custom Google Account Form */
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Enter Google Credentials
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      ← Back to saved
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Continue with this Account
                  </button>
                </form>
              )}

              {/* Privacy Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-slate-400" />
                  <span>Protected by Google Identity</span>
                </div>
                <div className="flex gap-2">
                  <span className="hover:underline cursor-pointer">Privacy</span>
                  <span>·</span>
                  <span className="hover:underline cursor-pointer">Terms</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
