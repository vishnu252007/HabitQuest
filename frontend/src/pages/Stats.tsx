import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Sun, CloudSun, Moon, Search, ShieldCheck, Flame, AlertTriangle, Sparkles,
  Zap, Calendar, TrendingUp,
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfWeek, getDay, subWeeks } from 'date-fns';
import { useHabitStore, type DailyLog } from '../store/habitStore';
import api from '../lib/api';

interface WeeklyStat { day: string; completed: number; total: number; rate: number; }
interface Insights {
  bestHabit: { name: string; emoji: string; rate: number } | null;
  bestDay: { day: string; rate: number } | null;
  longestStreak: { habitName: string; emoji: string; days: number } | null;
  consistency7Day: number;
  consistency30Day: number;
  totalCompletions: number;
}

// ── Reusable Heatmap Grid Component ──
function HeatmapGrid({
  logs,
  habitIds,
  colorScheme,
  label,
}: {
  logs: DailyLog[];
  habitIds: number[];
  colorScheme: 'green' | 'rose';
  label: string;
}) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const data = useMemo(() => {
    const map: Record<string, number> = {};
    const totalHabits = habitIds.length || 1;

    for (const log of logs) {
      if (log.completed && habitIds.includes(log.habit_id)) {
        map[log.log_date] = (map[log.log_date] || 0) + 1;
      }
    }

    // 52 weeks of dates
    const startDay = subWeeks(startOfWeek(today, { weekStartsOn: 0 }), 51);
    const allDays = eachDayOfInterval({ start: startDay, end: today });

    const weeks: { date: Date; dateStr: string; count: number; level: number }[][] = [];
    let currentWeek: { date: Date; dateStr: string; count: number; level: number }[] = [];

    for (const day of allDays) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = map[dateStr] || 0;
      const ratio = count / totalHabits;
      let level = 0;
      if (ratio >= 1) level = 4;
      else if (ratio >= 0.75) level = 3;
      else if (ratio >= 0.5) level = 2;
      else if (count > 0) level = 1;

      if (getDay(day) === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({ date: day, dateStr, count, level });
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Streak stats
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalActiveDays = 0;

    for (let i = 0; i < 365; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      if (map[d] && map[d] > 0) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    for (const day of allDays) {
      const d = format(day, 'yyyy-MM-dd');
      if (map[d] && map[d] > 0) {
        tempStreak++;
        totalActiveDays++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Month labels positioned relative to week columns
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: format(firstDay.date, 'MMM'), weekIndex: wi });
          lastMonth = month;
        }
      }
    });

    return { weeks, currentStreak, maxStreak, totalActiveDays, monthLabels };
  }, [logs, habitIds]);

  const COLORS_GREEN = ['bg-slate-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'];
  const COLORS_ROSE = ['bg-slate-100', 'bg-rose-200', 'bg-rose-400', 'bg-rose-500', 'bg-rose-600'];
  const colors = colorScheme === 'green' ? COLORS_GREEN : COLORS_ROSE;

  const accentText = colorScheme === 'green' ? 'text-emerald-600' : 'text-rose-600';
  const accentBg = colorScheme === 'green' ? 'from-emerald-50 to-teal-50' : 'from-rose-50 to-pink-50';
  const accentBorder = colorScheme === 'green' ? 'border-emerald-200/60' : 'border-rose-200/60';
  const ringColor = colorScheme === 'green' ? 'ring-emerald-500' : 'ring-rose-500';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        {colorScheme === 'green' ? (
          <Sparkles className="w-4 h-4 text-emerald-500" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-rose-500" />
        )}
        <h2 className="text-sm font-black text-slate-900">{label}</h2>
      </div>

      {/* Streak Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-3.5 border border-rose-200/60`}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Current Streak</span>
          </div>
          <div className="text-xl font-black text-slate-900">{data.currentStreak} <span className="text-xs font-bold text-slate-400">days</span></div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-3.5 border border-amber-200/60">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Max Streak</span>
          </div>
          <div className="text-xl font-black text-slate-900">{data.maxStreak} <span className="text-xs font-bold text-slate-400">days</span></div>
        </div>

        <div className={`bg-gradient-to-br ${accentBg} rounded-2xl p-3.5 border ${accentBorder}`}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Calendar className={`w-3.5 h-3.5 ${accentText}`} />
            <span className={`text-[9px] font-bold ${accentText} uppercase tracking-wider`}>Active Days</span>
          </div>
          <div className="text-xl font-black text-slate-900">{data.totalActiveDays} <span className="text-xs font-bold text-slate-400">days</span></div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3.5 border border-blue-200/60">
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Habits</span>
          </div>
          <div className="text-xl font-black text-slate-900">{habitIds.length} <span className="text-xs font-bold text-slate-400">tracked</span></div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-600">
            {data.totalActiveDays} contributions in the last year
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <span>Less</span>
            {colors.map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="inline-block min-w-[700px]">
            {/* Month labels - use relative positioning within inline-block */}
            <div className="relative h-4 ml-7">
              {data.monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold text-slate-400 absolute"
                  style={{ left: `${m.weekIndex * 13}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex gap-[2px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] mr-0.5 flex-shrink-0">
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                  <div key={i} className="h-[11px] w-6 text-[9px] font-semibold text-slate-400 flex items-center justify-end pr-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              {data.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {wi === 0 && Array.from({ length: 7 - week.length }).map((_, pi) => (
                    <div key={`pad-${pi}`} className="w-[11px] h-[11px]" />
                  ))}
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      className={`w-[11px] h-[11px] rounded-[2px] ${colors[day.level]} ${
                        day.dateStr === todayStr ? `ring-1 ${ringColor} ring-offset-1` : ''
                      }`}
                      title={`${day.dateStr}: ${day.count} habit${day.count !== 1 ? 's' : ''} completed`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Stats() {
  const { getActiveHabits, streaks, todayLogs, fetchAllLogs } = useHabitStore();
  const [progressMode, setProgressMode] = useState<'good' | 'bad'>('good');
  const [searchTerm, setSearchTerm] = useState('');
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    fetchAllLogs();
    api.get('/stats/weekly').then((r) => setWeeklyStats(r.data.data)).catch(() => {});
    api.get('/stats/insights').then((r) => setInsights(r.data.data)).catch(() => {});
  }, []);

  const activeHabits = getActiveHabits();
  const goodHabits = activeHabits.filter((h) => h.category !== 'bad_habit');
  const badHabits = activeHabits.filter((h) => h.category === 'bad_habit');

  const goodHabitIds = goodHabits.map((h) => h.id);
  const badHabitIds = badHabits.map((h) => h.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Mode Switcher Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {progressMode === 'good' ? 'Good Habits Progress' : 'Bad Habits Analysis'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {progressMode === 'good'
              ? 'Track streaks, completion heatmap, and points earned'
              : 'Analyze clean days, relapses, and overcome triggers'}
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setProgressMode('good')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              progressMode === 'good'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Good Habits</span>
          </button>

          <button
            onClick={() => setProgressMode('bad')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              progressMode === 'bad'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            <span>Bad Habits</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {progressMode === 'good' ? (
          /* ── GOOD HABITS PROGRESS VIEW ── */
          <motion.div
            key="good-progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* GOOD HABITS HEATMAP */}
            <HeatmapGrid
              logs={todayLogs}
              habitIds={goodHabitIds}
              colorScheme="green"
              label="✨ Good Habits Streak & Activity Heatmap"
            />

            {/* Weekly Bar Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Weekly Completion Progress
              </h2>
              {weeklyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={weeklyStats} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }}
                      formatter={(val?: any) => [`${val ?? 0} completions`, '']}
                    />
                    <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-36 flex items-center justify-center text-slate-400 text-xs">
                  No completion data yet — check off good habits to see your weekly stats!
                </div>
              )}
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    7-Day Consistency
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    {insights ? `${insights.consistency7Day}%` : '—'}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${insights?.consistency7Day ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Weekly Rhythm
                </span>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyStats}>
                      <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-100">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Top Good Habit
                </span>
                {insights?.bestHabit ? (
                  <div className="flex flex-col items-center justify-center h-24">
                    <div className="text-3xl mb-1">{insights.bestHabit.emoji}</div>
                    <p className="text-xs font-bold text-slate-900 text-center">{insights.bestHabit.name}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{insights.bestHabit.rate} completions</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-slate-400 text-xs font-medium">
                    No habit logs recorded
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Peak Focus Time
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700">
                    <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Morning (8:00 AM)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700">
                    <Sun className="w-3.5 h-3.5 text-orange-500" />
                    <span>Afternoon (2:00 PM)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Evening (9:00 PM)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Good Habits Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active Good Habits ({goodHabits.length})
                </h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search habits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-emerald-500 w-44"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <div>Habit Name</div>
                <div>Category</div>
                <div>Points / Day</div>
                <div>Frequency</div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {goodHabits.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No good habits added yet.
                  </div>
                ) : (
                  goodHabits
                    .filter((h) => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((habit) => (
                      <div
                        key={habit.id}
                        className="grid grid-cols-4 px-6 py-3.5 items-center text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-base">{habit.emoji}</span>
                          <span>{habit.name}</span>
                        </div>
                        <div className="capitalize font-medium text-slate-500">{habit.category}</div>
                        <div className="font-bold text-emerald-600">+{habit.point_value} pts</div>
                        <div className="capitalize font-medium text-slate-500">{habit.frequency}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── BAD HABITS ANALYSIS VIEW ── */
          <motion.div
            key="bad-analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* BAD HABITS HEATMAP */}
            <HeatmapGrid
              logs={todayLogs}
              habitIds={badHabitIds}
              colorScheme="rose"
              label="🛡️ Bad Habits Clean Days & Activity Heatmap"
            />

            {/* Bad Habits Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    🚫
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Bad Habits Count
                    </span>
                    <span className="text-xl font-black text-slate-900">{badHabits.length} Habits</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Habits targeted for reduction</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Days Free Streak
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {streaks.length > 0 ? `${Math.max(0, ...streaks.map((s) => s.currentStreak))} Days` : '0 Days'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Clean streak maintaining focus</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Overcome Rate
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {badHabits.length > 0 ? '85%' : '100%'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Reduction success score</p>
              </div>
            </div>

            {/* Bad Habits Relapse Analysis */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bad Habit Relapse Analysis & Triggers
              </h2>
              {badHabits.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No bad habits registered. Click "+ Add Habit" to add a bad habit to overcome!
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {badHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{habit.emoji}</span>
                          <span className="font-bold text-xs text-slate-900">{habit.name}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          Negative Habit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {habit.description || 'Focus on replacing this impulse with a positive action.'}
                      </p>
                      <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500 font-semibold border-t border-rose-100">
                        <span>Risk Level: Moderate</span>
                        <span>Goal: Zero Relapses</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bad Habits Overcome Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Bad Habits Overcome List ({badHabits.length})
                </h3>
              </div>

              <div className="grid grid-cols-4 px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <div>Habit Name</div>
                <div>Status</div>
                <div>Points Reclaimed</div>
                <div>Frequency</div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {badHabits.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No bad habits added to overcome.
                  </div>
                ) : (
                  badHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="grid grid-cols-4 px-6 py-3.5 items-center text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-base">{habit.emoji}</span>
                        <span>{habit.name}</span>
                      </div>
                      <div className="font-semibold text-rose-600">Active Overcome</div>
                      <div className="font-bold text-slate-900">+{habit.point_value} pts</div>
                      <div className="capitalize font-medium text-slate-500">{habit.frequency}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
