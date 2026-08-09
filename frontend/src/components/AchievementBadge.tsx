import { motion } from 'framer-motion';
import type { AchievementType } from '../types';
import { ACHIEVEMENT_DEFINITIONS } from '../types';

interface AchievementBadgeProps {
  type: AchievementType;
  earned: boolean;
  earnedAt?: string;
  delay?: number;
}

export default function AchievementBadge({ type, earned, earnedAt: _earnedAt, delay = 0 }: AchievementBadgeProps) {
  const def = ACHIEVEMENT_DEFINITIONS[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`card-light p-4 text-center relative overflow-hidden transition-all ${
        earned
          ? 'bg-white border-amber-200'
          : 'bg-slate-50 opacity-50 grayscale'
      }`}
    >
      <div className="text-3xl mb-2">{def.icon}</div>

      <h3 className={`text-xs font-bold mb-1 ${earned ? 'text-slate-900' : 'text-slate-500'}`}>
        {def.title}
      </h3>

      <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
        {def.description}
      </p>

      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          earned
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-slate-200 text-slate-500'
        }`}
      >
        +{def.points} pts
      </div>

      {!earned && (
        <div className="absolute top-2 right-2 text-xs">🔒</div>
      )}
    </motion.div>
  );
}
