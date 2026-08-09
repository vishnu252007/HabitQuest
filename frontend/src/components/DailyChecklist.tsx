import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, Calendar } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';

export default function DailyChecklist() {
  const { todayLogs, toggleLog, getActiveHabits } = useHabitStore();
  const { refreshUser } = useAuthStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const activeHabits = getActiveHabits();

  const completedCount = activeHabits.filter((h) => {
    return todayLogs.some((l) => l.habit_id === h.id && l.log_date === today && l.completed);
  }).length;

  const completionRate =
    activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;

  const handleToggle = async (habitId: number) => {
    await toggleLog(habitId, today);
    await refreshUser();
  };

  if (activeHabits.length === 0) {
    return (
      <div className="card-light p-8 text-center">
        <div className="text-4xl mb-3">🎯</div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No habits yet</h3>
        <p className="text-xs text-slate-500">Create your first habit to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="card-light p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Today's Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{format(new Date(), 'EEEE, MMM d, yyyy')}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
          <p className="text-xs text-slate-500">
            {completedCount}/{activeHabits.length} done
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-4">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Habit list */}
      <div className="space-y-2">
        {activeHabits.map((habit, index) => {
          const isCompleted = todayLogs.some(
            (l) => l.habit_id === habit.id && l.log_date === today && l.completed
          );

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleToggle(habit.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all ${
                isCompleted
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/70'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-blue-600 text-white' : 'border-2 border-slate-300 bg-white'
                }`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5" />}
              </div>

              <span className="text-lg">{habit.emoji}</span>
              <span
                className={`text-sm font-medium flex-1 ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                }`}
              >
                {habit.name}
              </span>

              <span
                className={`text-xs font-semibold ${isCompleted ? 'text-blue-600' : 'text-slate-400'}`}
              >
                {isCompleted ? `+${habit.point_value}` : `${habit.point_value} pts`}
              </span>
            </motion.div>
          );
        })}
      </div>

      {completionRate === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center"
        >
          <p className="text-xs font-semibold text-emerald-800">
            🎉 All habits completed for today! Awesome work!
          </p>
        </motion.div>
      )}
    </div>
  );
}
