import { motion } from 'framer-motion';
import { Check, Flame, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore, type Habit } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  health: { label: 'Health', emoji: '❤️' },
  fitness: { label: 'Fitness', emoji: '💪' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘' },
  learning: { label: 'Learning', emoji: '📚' },
  productivity: { label: 'Productivity', emoji: '⚡' },
  social: { label: 'Social', emoji: '👥' },
  creativity: { label: 'Creativity', emoji: '🎨' },
  finance: { label: 'Finance', emoji: '💰' },
  other: { label: 'Other', emoji: '📌' },
};

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { toggleLog, todayLogs, getHabitStreak, deleteHabit } = useHabitStore();
  const { refreshUser } = useAuthStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayLog = todayLogs.find((l) => l.habit_id === habit.id && l.log_date === today);
  const isCompleted = todayLog?.completed || false;
  const streak = getHabitStreak(habit.id);
  const category = CATEGORY_LABELS[habit.category] ?? { label: habit.category, emoji: '📌' };

  const handleToggle = async () => {
    await toggleLog(habit.id, today);
    await refreshUser(); // Refresh points/level from server
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
      await deleteHabit(habit.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`card-light p-4 relative overflow-hidden group transition-all ${
        isCompleted ? 'bg-slate-50/70 border-slate-200' : 'hover:border-blue-300 hover:shadow-subtle-md'
      }`}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: habit.color }} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs"
            style={{ backgroundColor: `${habit.color}15`, border: `1px solid ${habit.color}30` }}
          >
            {habit.emoji}
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {habit.name}
            </h3>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              {category.emoji} {category.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{habit.description}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {streak.currentStreak > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              <Flame className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">
                {streak.currentStreak}d 🔥
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
            <span className="text-xs font-semibold text-blue-600">
              +{habit.point_value} pts
            </span>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
