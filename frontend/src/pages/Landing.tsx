import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Flame,
  CheckCircle2,
  Target,
  ShieldCheck,
  Zap,
  ArrowRight,
  BarChart3,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function Hero3DCard() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({ x: -y / 12, y: x / 12 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto max-w-md cursor-pointer select-none"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className="relative bg-gradient-to-br from-white/95 via-white/85 to-rose-50/70 backdrop-blur-2xl rounded-3xl p-7 border border-white/90 shadow-2xl shadow-rose-500/20 space-y-6 transform-gpu"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Floating 3D Header */}
        <div className="flex items-center justify-between" style={{ transform: 'translateZ(35px)' }}>
          <div>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">
              3D GAMIFIED ENGINE
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Habit Matrix 3D</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/30">
            💎
          </div>
        </div>

        {/* 3D Interactive Habit Gem Spheres */}
        <div className="grid grid-cols-2 gap-3" style={{ transform: 'translateZ(50px)' }}>
          {[
            { id: 1, icon: '🏃', name: 'Morning Run', streak: '14 Days Free', pts: '+25 XP' },
            { id: 2, icon: '💧', name: 'Hydration', streak: '8 Glasses Today', pts: '+10 XP' },
            { id: 3, icon: '📖', name: 'Read 20 Pages', streak: '8 Day Streak', pts: '+15 XP' },
            { id: 4, icon: '🧘', name: 'Meditation', streak: '5 Day Streak', pts: '+20 XP' },
          ].map((h) => (
            <motion.div
              key={h.id}
              whileHover={{ scale: 1.06, translateZ: 70 }}
              onClick={() => setActiveItem(activeItem === h.id ? null : h.id)}
              className={`p-4 rounded-2xl border transition-all space-y-1.5 shadow-md ${
                activeItem === h.id
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white/90 border-slate-200/80 hover:border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{h.icon}</span>
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
                  {h.pts}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900">{h.name}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{h.streak}</div>
            </motion.div>
          ))}
        </div>

        {/* Floating 3D Level Rank Badge */}
        <div
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white flex items-center justify-between shadow-2xl border border-white/10"
          style={{ transform: 'translateZ(65px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              Lv.5
            </div>
            <div>
              <div className="text-xs font-black text-white">Grandmaster Rank</div>
              <div className="text-[10px] text-rose-300 font-semibold">1,450 / 2,000 XP Points</div>
            </div>
          </div>
          <span className="text-xs font-black text-amber-400">🔥 42 Days</span>
        </div>

        <p className="text-[11px] text-slate-400 text-center font-medium italic" style={{ transform: 'translateZ(20px)' }}>
          ✨ Move your mouse over this 3D card to experience interactive 3D rotation!
        </p>
      </motion.div>

      {/* Floating 3D Achievement Badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="hidden sm:flex absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200 shadow-xl items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-lg">
          🏆
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">Achievement Unlocked!</p>
          <p className="text-[10px] text-slate-500 font-medium">🌱 Getting Started Badge</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
        className="hidden sm:flex absolute -top-4 -right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200 shadow-xl items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-lg">
          ⚡
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">Level 2 Champion</p>
          <p className="text-[10px] text-slate-500 font-medium">+125 Bonus Points</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-900 selection:bg-rose-500 selection:text-white font-sans overflow-x-hidden">
      {/* Background Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute top-48 -right-32 h-[550px] w-[550px] rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Header Navigation matching HabitBox style */}
      <header className="sticky top-0 z-50 bg-[#fbfaf8]/80 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Habit<span className="text-rose-600">Quest</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-rose-600 transition-colors">Features</a>
            <a href="#analytics" className="hover:text-rose-600 transition-colors">Analytics</a>
            <a href="#gamification" className="hover:text-rose-600 transition-colors">Gamification</a>
            <a href="#reviews" className="hover:text-rose-600 transition-colors">Reviews</a>
          </div>

          {/* Desktop Functional Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary py-2.5 px-6 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-lg px-6 py-4 space-y-3"
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Features
              </a>
              <a
                href="#analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Analytics
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 py-1"
              >
                Reviews
              </a>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 text-center"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 text-center"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION WITH 3D TILT MATRIX */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-xs font-bold text-rose-600 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span>Smart Gamified Habit Tracker · Built for Web & Mobile</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900">
                Become the person who{' '}
                <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                  shows up every day.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Build daily habits, track streaks, earn points, unlock rank achievements, and conquer bad habits with a beautiful, gamified workspace.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Your Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Start Building Free</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Sign In to Account</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Pills */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  100% Free & Secure
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Instant Gamified Setup
                </span>
              </div>
            </div>

            {/* Right 3D Interactive Canvas Component */}
            <div className="lg:col-span-6">
              <Hero3DCard />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS BAND */}
      <section className="py-10 border-y border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-black text-slate-900">1-Tap</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Fast Check-ins</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-black text-rose-600">100%</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Customizable Habits</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-black text-slate-900">7 Ranks</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Gamified Progression</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-black text-purple-600">0 Ads</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Private & Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-28 bg-[#fbfaf8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-extrabold uppercase tracking-wider border border-rose-200">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Everything you need to <span className="text-rose-600">master daily habits</span>
            </h2>
            <p className="text-base text-slate-600">
              Build positive habits, overcome bad habits, track streaks, and analyze your growth over time.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Good & Bad Habit Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build healthy daily routines or overcome bad habits with dedicated tracking tabs and specialized point rewards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automatic Streaks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch your daily streak grow automatically. Stay consistent and unlock streak milestones at 7, 30, and 100 days.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gamified Level Progression</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Earn experience points for every completed habit. Advance through 7 rank tiers from Beginner to Legendary Master.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Powerful Progress Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visualize weekly completion charts, 7-day and 30-day consistency scores, and peak focus zones.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Goal Milestone Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Associate specific habits with long-term goals and target dates to stay focused on big achievements.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Secure API & Local Database</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your data is stored safely in an encrypted SQLite database with JWT authorization and zero third-party tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews" className="py-20 sm:py-28 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold uppercase tracking-wider border border-amber-200">
              User Love
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Loved by habit builders
            </h2>
            <p className="text-sm text-slate-600">Here's what our community has to say about HabitQuest.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#fbfaf8] rounded-3xl p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                "The gamification points and level progression kept me motivated when nothing else did. I've maintained a 30-day exercise streak for the first time!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                  S
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-400">Level 4 · Fitness Enthusiast</p>
                </div>
              </div>
            </div>

            <div className="bg-[#fbfaf8] rounded-3xl p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                "Having separate tracking for good habits and bad habits to quit is a game changer. The Magic Fill feature also makes adding habits instant!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  M
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Marcus Vance</p>
                  <p className="text-[10px] text-slate-400">Level 3 · Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-[#fbfaf8] rounded-3xl p-6 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                "Super clean UI, no ads, fast responses, and everything syncs seamlessly. Best habit tracking website out there."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  E
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Elena Rostova</p>
                  <p className="text-[10px] text-slate-400">Level 5 · Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="py-20 bg-gradient-to-br from-rose-600 via-rose-500 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Ready to level up your habits today?
          </h2>
          <p className="text-base text-rose-100 max-w-xl mx-auto">
            Join thousands of habit builders. Create your free account in seconds and start building streaks.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-rose-600 bg-white hover:bg-rose-50 shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-rose-600 bg-white hover:bg-rose-50 shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-white">HabitQuest</span>
          </div>
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} HabitQuest. Gamified habit tracking for better lives.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
