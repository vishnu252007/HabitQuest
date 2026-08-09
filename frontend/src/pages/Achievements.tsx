import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Award } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import api from '../lib/api';

interface Achievement {
  id: number;
  key: string;
  title: string;
  description: string;
  icon: string;
  points_earned: number;
  earned_at: string;
}

const ALL_ACHIEVEMENTS = [
  { key: 'first_completion', title: 'Getting Started', description: 'Complete your first habit', icon: '🌱', points: 10 },
  { key: 'streak_7', title: '7 Day Streak', description: 'Maintain a 7-day streak', icon: '🔥', points: 50 },
  { key: 'streak_30', title: '30 Day Streak', description: 'Maintain a 30-day streak', icon: '💪', points: 200 },
  { key: 'streak_100', title: '100 Day Streak', description: 'Maintain a 100-day streak', icon: '🏆', points: 500 },
  { key: 'habits_5', title: 'Habit Builder', description: 'Create 5 different habits', icon: '📋', points: 25 },
  { key: 'habits_10', title: 'Habit Master', description: 'Create 10 different habits', icon: '🎯', points: 75 },
  { key: 'points_1000', title: 'Rising Star', description: 'Earn 1,000 total points', icon: '⭐', points: 50 },
  { key: 'points_5000', title: 'Superstar', description: 'Earn 5,000 total points', icon: '🌟', points: 100 },
  { key: 'perfect_week', title: 'Perfect Week', description: 'Complete all habits for 7 days', icon: '💎', points: 100 },
];

export default function Achievements() {
  const { streaks } = useHabitStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    api.get('/stats/achievements').then((res) => {
      setAchievements(res.data.data);
    }).catch(() => {});
  }, []);

  const earnedKeys = new Set(achievements.map((a) => a.key));
  const totalBonusPoints = achievements.reduce((sum, a) => sum + a.points_earned, 0);
  const bestStreak = Math.max(0, ...streaks.map((s) => s.currentStreak));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Achievements & Badges
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Unlock rewards as you reach habit milestones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-light p-4 text-center">
          <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900">
            {achievements.length}/{ALL_ACHIEVEMENTS.length}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Badges Earned</p>
        </div>
        <div className="card-light p-4 text-center">
          <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900">{totalBonusPoints}</p>
          <p className="text-[10px] text-slate-500 font-medium">Bonus Points</p>
        </div>
        <div className="card-light p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900">{bestStreak}d</p>
          <p className="text-[10px] text-slate-500 font-medium">Best Active Streak</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">All Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_ACHIEVEMENTS.map((def, index) => {
            const earned = earnedKeys.has(def.key);
            const achievement = achievements.find((a) => a.key === def.key);
            return (
              <motion.div
                key={def.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                className={`card-light p-4 text-center transition-all ${
                  earned
                    ? 'border-amber-200 bg-amber-50/50 shadow-subtle-sm'
                    : 'opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl mb-2">{def.icon}</div>
                <p className="text-xs font-bold text-slate-900">{def.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
                <div className="mt-2 text-[10px] font-semibold text-blue-600">+{def.points} pts</div>
                {earned && achievement && (
                  <div className="mt-1 text-[9px] text-emerald-600 font-medium">
                    ✓ {new Date(achievement.earned_at).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
