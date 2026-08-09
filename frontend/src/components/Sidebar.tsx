import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Inbox,
  Trophy,
  Target,
  LogOut,
  ChevronDown,
  BookOpen,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

export default function Sidebar({
  selectedCategory,
  setSelectedCategory,
}: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isProgressActive = location.pathname === '/stats';
  const isAllHabitsActive = location.pathname === '/dashboard' && !selectedCategory;
  const isAchievementsActive = location.pathname === '/achievements';
  const isGoalsActive = location.pathname === '/goals';

  return (
    <aside className="w-64 bg-[#f3f4f6] border-r border-slate-200 flex flex-col h-screen select-none overflow-y-auto flex-shrink-0 text-slate-700">
      {/* Top User Profile Bar */}
      <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {user.username}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Lv.{user.level} · {user.total_points} pts</span>
            </div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
      </div>

      {/* Navigation list */}
      <div className="p-3 space-y-6 flex-1">
        {/* Main Links */}
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedCategory(null);
              navigate('/dashboard');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isAllHabitsActive
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>All Habits</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory(null);
              navigate('/stats');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isProgressActive
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Progress</span>
          </button>
        </div>

        {/* PREFERENCES section */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Preferences
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => navigate('/achievements')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isAchievementsActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Achievements</span>
            </button>

            <button
              onClick={() => navigate('/goals')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isGoalsActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Target className="w-4 h-4 text-teal-600" />
              <span>Goals</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-all">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Resources</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
