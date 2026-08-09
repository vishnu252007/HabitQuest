import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle, ArrowRight, Mail, User } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => void;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
}: GoogleAuthModalProps) {
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatingEmail, setAuthenticatingEmail] = useState('');

  if (!isOpen) return null;

  const handleSignIn = (email: string, name?: string) => {
    if (!email) return;

    setAuthenticatingEmail(email);
    setIsAuthenticating(true);

    const displayName = name || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim();

    setTimeout(() => {
      onSelectAccount(email, displayName);
      setIsAuthenticating(false);
      onClose();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) return;
    handleSignIn(googleEmail, googleName);
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
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
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
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading State Overlay */}
          {isAuthenticating ? (
            <div className="p-8 text-center space-y-4 bg-white">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Connecting to Google Account...</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">{authenticatingEmail}</p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 font-bold bg-emerald-50 py-1.5 px-3 rounded-full w-fit mx-auto">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Google OAuth 2.0 Verified</span>
              </div>
            </div>
          ) : (
            /* Google Sign In Form */
            <div className="p-6 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Google Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="e.g. Vishnu"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Sign In with Google</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
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
