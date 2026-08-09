import { motion } from 'framer-motion';
import { Zap, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function levelProgress(points: number): number {
  const pointsInLevel = points % 1000;
  return (pointsInLevel / 1000) * 100;
}

function pointsToNextLevel(points: number): number {
  return 1000 - (points % 1000);
}

function formatPoints(points: number): string {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
  return points.toString();
}

export default function LevelProgress() {
  const { user } = useAuthStore();
  if (!user) return null;

  const points = user.total_points;
  const progress = levelProgress(points);
  const toNext = pointsToNextLevel(points);

  return (
    <div className="card-light p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {user.level}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Level {user.level}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              🏅 {user.rank}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-blue-600 font-bold text-base">
            <Star className="w-4 h-4 fill-blue-600" />
            <span>{formatPoints(points)}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">total points</span>
        </div>
      </div>

      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Progress to Level {user.level + 1}</span>
          <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>
          <strong className="text-slate-800">{toNext}</strong> points to Level {user.level + 1}
        </span>
      </div>
    </div>
  );
}
