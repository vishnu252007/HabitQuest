import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Calendar, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { useHabitStore } from '../store/habitStore';

// Goals are stored locally (not backed by API) — lightweight client-side feature
interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  habitIds: number[];
  completed: boolean;
  createdAt: string;
}

interface GoalForm {
  title: string;
  description: string;
  targetDate: string;
  habitIds: number[];
}

export default function Goals() {
  const { todayLogs, getActiveHabits } = useHabitStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<GoalForm>({
    title: '',
    description: '',
    targetDate: '',
    habitIds: [],
  });

  const activeHabits = getActiveHabits();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetDate) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      targetDate: form.targetDate,
      habitIds: form.habitIds,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    setForm({ title: '', description: '', targetDate: '', habitIds: [] });
    setIsModalOpen(false);
  };

  const handleToggleHabit = (habitId: number) => {
    setForm((prev) => ({
      ...prev,
      habitIds: prev.habitIds.includes(habitId)
        ? prev.habitIds.filter((id) => id !== habitId)
        : [...prev.habitIds, habitId],
    }));
  };

  const getGoalProgress = (goal: Goal): number => {
    if (goal.habitIds.length === 0) return 0;
    const completedForGoal = todayLogs.filter(
      (l) => goal.habitIds.includes(l.habit_id) && l.completed
    ).length;
    return Math.min(100, Math.round((completedForGoal / goal.habitIds.length) * 100));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleGoalComplete = (id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Goals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Set milestones to stay on track</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-light p-4 text-center">
          <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900">{activeGoals.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Active Goals</p>
        </div>
        <div className="card-light p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900">{completedGoals.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Completed</p>
        </div>
        <div className="card-light p-4 text-center">
          <Target className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900">{goals.length}</p>
          <p className="text-[10px] text-slate-500 font-medium">Total</p>
        </div>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="card-light p-12 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">No goals yet</h3>
          <p className="text-xs text-slate-500 mb-4">Create a goal to track long-term progress</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Create First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...activeGoals, ...completedGoals].map((goal, index) => {
            const progress = getGoalProgress(goal);
            const isExpired = !goal.completed && isPast(parseISO(goal.targetDate));
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`card-light p-5 ${goal.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`flex items-center gap-1 text-[10px] font-semibold ${isExpired ? 'text-rose-500' : 'text-slate-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {isExpired ? 'Expired' : 'Due'} {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => toggleGoalComplete(goal.id)}
                      className={`p-1.5 rounded-lg transition-all ${goal.completed ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.habitIds.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                      <span>Today's progress</span>
                      <span className="font-bold text-blue-600">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {goal.habitIds.map((hId) => {
                        const h = activeHabits.find((hab) => hab.id === hId);
                        if (!h) return null;
                        return (
                          <span key={hId} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {h.emoji} {h.name}
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Create New Goal
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Complete 30-day fitness challenge"
                    className="input-light"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="input-light resize-none"
                    placeholder="Optional details..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Date *</label>
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    className="input-light"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {activeHabits.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Associated Habits
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {activeHabits.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => handleToggleHabit(h.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            form.habitIds.includes(h.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span>{h.emoji}</span>
                          <span className="truncate">{h.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
