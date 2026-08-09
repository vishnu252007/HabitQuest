import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Check,
  Search,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  X as XIcon,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay, isAfter } from 'date-fns';
import { useHabitStore, type Habit } from '../store/habitStore';
import { useFilters } from '../App';
import AddHabitModal from '../components/AddHabitModal';

export default function Dashboard() {
  const {
    todayLogs,
    fetchHabits,
    fetchAllLogs,
    fetchStreaks,
    toggleLog,
    seedSampleHabits,
    getActiveHabits,
  } = useHabitStore();

  const { selectedCategory } = useFilters();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<'good' | 'bad'>('good');
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [selectedHabitIds, setSelectedHabitIds] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<{ positive: boolean; negative: boolean }>({
    positive: true,
    negative: true,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial habits & all past logs
  useEffect(() => {
    fetchHabits();
    fetchAllLogs();
    fetchStreaks();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAddDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeHabits = getActiveHabits();

  // Generate 10-day rolling dates (ending today)
  const todayDate = new Date();
  const dateInterval = eachDayOfInterval({
    start: subDays(todayDate, 9),
    end: todayDate,
  });

  const dateColumns = dateInterval.map((d) => ({
    dateObj: d,
    dateStr: format(d, 'yyyy-MM-dd'),
    dayLetter: format(d, 'EEEEEE'),
    dayNumber: format(d, 'd'),
    isToday: isSameDay(d, todayDate),
  }));

  // Separate habits into Positive (Good) and Negative (Bad)
  const positiveHabits = activeHabits.filter((h) => h.category !== 'bad_habit');
  const negativeHabits = activeHabits.filter((h) => h.category === 'bad_habit');

  // Filter based on search & global filters
  const filterHabits = (list: Habit[]) => {
    let filtered = list;
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((h) => h.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((h) => h.name.toLowerCase().includes(q));
    }
    return filtered;
  };

  const filteredPositive = filterHabits(positiveHabits);
  const filteredNegative = filterHabits(negativeHabits);

  const openAddModal = (type: 'good' | 'bad') => {
    setModalDefaultType(type);
    setIsModalOpen(true);
    setIsAddDropdownOpen(false);
  };

  const handleToggleHabitSelect = (id: number) => {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchAction = async (action: 'complete' | 'skip' | 'fail') => {
    if (selectedHabitIds.length === 0) return;
    const todayStr = format(todayDate, 'yyyy-MM-dd');

    for (const habitId of selectedHabitIds) {
      if (action === 'complete') {
        const isLogged = todayLogs.some((l) => l.habit_id === habitId && l.log_date === todayStr && l.completed);
        if (!isLogged) {
          await toggleLog(habitId, todayStr);
        }
      } else if (action === 'fail' || action === 'skip') {
        await toggleLog(habitId, todayStr);
      }
    }
    setSelectedHabitIds([]);
  };

  const isHabitCompletedOnDate = (habitId: number, dateStr: string) => {
    return todayLogs.some((l) => l.habit_id === habitId && l.log_date === dateStr && l.completed);
  };

  const getTodayCompletionCount = (habitId: number) => {
    const todayStr = format(todayDate, 'yyyy-MM-dd');
    const isCompleted = isHabitCompletedOnDate(habitId, todayStr);
    return isCompleted ? 1 : 0;
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto">

      {/* ── Top Bar Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Left: View Switcher & Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white w-48 transition-all"
            />
          </div>
        </div>

        {/* Right: White "+ Add Habit" Button with Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs text-xs font-bold text-slate-800 flex items-center gap-2 transition-all hover:border-slate-300 active:scale-95"
          >
            <Plus className="w-4 h-4 text-rose-500" />
            <span>Add habit</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Add Habit Dropdown Options */}
          <AnimatePresence>
            {isAddDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 space-y-1"
              >
                <button
                  onClick={() => openAddModal('good')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left hover:bg-rose-50/80 transition-colors text-xs font-semibold text-slate-800 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✨
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-rose-600">New Habit</div>
                    <div className="text-[10px] text-slate-400 font-normal">Build a positive daily habit</div>
                  </div>
                </button>

                <button
                  onClick={() => openAddModal('bad')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left hover:bg-rose-50/80 transition-colors text-xs font-semibold text-slate-800 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                    🚫
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-rose-600">Bad Overcome Habit</div>
                    <div className="text-[10px] text-slate-400 font-normal">Quit a negative habit</div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty State Banner */}
      {activeHabits.length === 0 && (
        <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="text-4xl">🌱</div>
          <h3 className="text-base font-bold text-slate-900">No habits created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the white <strong>"+ Add habit"</strong> button at the top right to start tracking new habits or overcoming bad habits!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => openAddModal('good')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              + New Habit
            </button>
            <button
              onClick={() => seedSampleHabits()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              Load Sample Habits
            </button>
          </div>
        </div>
      )}

      {/* ── GRID VIEW (Calendar Matrix with ONLY TODAY ACTIVE) ── */}
      {viewMode === 'grid' && activeHabits.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                  <th className="py-3 px-4 text-xs font-bold text-slate-600 min-w-[200px]">
                    All Habits
                  </th>
                  {dateColumns.map((col) => (
                    <th
                      key={col.dateStr}
                      className={`py-3 px-2 text-center text-[11px] font-bold ${
                        col.isToday
                          ? 'text-rose-600 bg-rose-50/80 border-x border-rose-200/80 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="uppercase text-[10px] text-slate-400 font-semibold">{col.dayLetter}</div>
                      <div>{col.dayNumber}</div>
                      {col.isToday ? (
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mx-auto mt-0.5 animate-pulse" />
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* 1. Good / Positive Habits Section */}
                {filteredPositive.length > 0 && (
                  <>
                    <tr className="bg-slate-50/30 font-bold text-slate-600 text-xs">
                      <td colSpan={11} className="py-2.5 px-4">
                        <button
                          onClick={() =>
                            setExpandedSections((prev) => ({ ...prev, positive: !prev.positive }))
                          }
                          className="flex items-center gap-2 hover:text-slate-900"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              expandedSections.positive ? 'rotate-90' : ''
                            }`}
                          />
                          <span>{filteredPositive.length} Positive Habit{filteredPositive.length > 1 ? 's' : ''}</span>
                        </button>
                      </td>
                    </tr>
                    {expandedSections.positive &&
                      filteredPositive.map((habit) => (
                        <tr key={habit.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{habit.emoji}</span>
                              <div>
                                <div className="font-bold text-slate-900">{habit.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {getTodayCompletionCount(habit.id)} / 1 times
                                </div>
                              </div>
                            </div>
                          </td>
                          {dateColumns.map((col) => {
                            const completed = isHabitCompletedOnDate(habit.id, col.dateStr);
                            const isToday = col.isToday;

                            return (
                              <td
                                key={col.dateStr}
                                className={`py-3 px-2 text-center align-middle ${
                                  isToday ? 'bg-rose-50/30 border-x border-rose-200/50' : ''
                                }`}
                              >
                                {isToday ? (
                                  /* TODAY'S CELL: ACTIVE CLICKABLE CHECKMARK BUTTON */
                                  <button
                                    onClick={() => toggleLog(habit.id, col.dateStr)}
                                    className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 ${
                                      completed
                                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-400/40 scale-105'
                                        : 'bg-white hover:bg-slate-100 border-2 border-rose-500 text-rose-500 hover:scale-105'
                                    }`}
                                    title="Click to complete today's habit!"
                                  >
                                    {completed ? (
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    )}
                                  </button>
                                ) : (
                                  /* PAST OR FUTURE CELL: READ-ONLY DISPLAY */
                                  <div
                                    className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-semibold ${
                                      completed
                                        ? 'bg-emerald-500/80 text-white'
                                        : 'bg-slate-100/60 text-slate-300 border border-slate-200/50'
                                    }`}
                                    title={
                                      completed
                                        ? `Completed on ${col.dateStr}`
                                        : isAfter(col.dateObj, todayDate)
                                        ? 'Will open automatically on this day'
                                        : `Past date (${col.dateStr})`
                                    }
                                  >
                                    {completed ? (
                                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    ) : isAfter(col.dateObj, todayDate) ? (
                                      <Lock className="w-3 h-3 text-slate-300" />
                                    ) : (
                                      <span className="text-slate-300 text-[10px]">·</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </>
                )}

                {/* 2. Negative / Bad Overcome Habits Section */}
                {filteredNegative.length > 0 && (
                  <>
                    <tr className="bg-slate-50/30 font-bold text-slate-600 text-xs">
                      <td colSpan={11} className="py-2.5 px-4">
                        <button
                          onClick={() =>
                            setExpandedSections((prev) => ({ ...prev, negative: !prev.negative }))
                          }
                          className="flex items-center gap-2 hover:text-slate-900"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              expandedSections.negative ? 'rotate-90' : ''
                            }`}
                          />
                          <span>{filteredNegative.length} Negative Habit{filteredNegative.length > 1 ? 's' : ''} (Bad Overcome)</span>
                        </button>
                      </td>
                    </tr>
                    {expandedSections.negative &&
                      filteredNegative.map((habit) => (
                        <tr key={habit.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{habit.emoji}</span>
                              <div>
                                <div className="font-bold text-slate-900">{habit.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {getTodayCompletionCount(habit.id)} / 1 times
                                </div>
                              </div>
                            </div>
                          </td>
                          {dateColumns.map((col) => {
                            const completed = isHabitCompletedOnDate(habit.id, col.dateStr);
                            const isToday = col.isToday;

                            return (
                              <td
                                key={col.dateStr}
                                className={`py-3 px-2 text-center align-middle ${
                                  isToday ? 'bg-rose-50/30 border-x border-rose-200/50' : ''
                                }`}
                              >
                                {isToday ? (
                                  /* TODAY'S CELL: ACTIVE CLICKABLE CHECKMARK BUTTON */
                                  <button
                                    onClick={() => toggleLog(habit.id, col.dateStr)}
                                    className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 ${
                                      completed
                                        ? 'bg-rose-600 text-white ring-2 ring-rose-400/40 scale-105'
                                        : 'bg-white hover:bg-slate-100 border-2 border-rose-500 text-rose-500 hover:scale-105'
                                    }`}
                                    title="Click to check off today's bad habit!"
                                  >
                                    {completed ? (
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    )}
                                  </button>
                                ) : (
                                  /* PAST OR FUTURE CELL: READ-ONLY DISPLAY */
                                  <div
                                    className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-semibold ${
                                      completed
                                        ? 'bg-rose-500/80 text-white'
                                        : 'bg-slate-100/60 text-slate-300 border border-slate-200/50'
                                    }`}
                                    title={
                                      completed
                                        ? `Completed on ${col.dateStr}`
                                        : isAfter(col.dateObj, todayDate)
                                        ? 'Will open automatically on this day'
                                        : `Past date (${col.dateStr})`
                                    }
                                  >
                                    {completed ? (
                                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    ) : isAfter(col.dateObj, todayDate) ? (
                                      <Lock className="w-3 h-3 text-slate-300" />
                                    ) : (
                                      <span className="text-slate-300 text-[10px]">·</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </>
                )}

                {/* Inline Add Habit Row */}
                <tr>
                  <td colSpan={11} className="py-3 px-4">
                    <button
                      onClick={() => openAddModal('good')}
                      className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add habit</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && activeHabits.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-6">
          {/* Positive Habits */}
          {filteredPositive.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                <span>{filteredPositive.length} Positive Habit{filteredPositive.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredPositive.map((habit) => {
                  const todayStr = format(todayDate, 'yyyy-MM-dd');
                  const completed = isHabitCompletedOnDate(habit.id, todayStr);
                  const isSelected = selectedHabitIds.includes(habit.id);

                  return (
                    <div
                      key={habit.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleHabitSelect(habit.id)}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                          {habit.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{habit.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {completed ? '1 / 1 times' : '0 / 1 times'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleLog(habit.id, todayStr)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          completed
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'border-2 border-rose-500 text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Negative Habits */}
          {filteredNegative.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                <span>{filteredNegative.length} Negative Habit{filteredNegative.length > 1 ? 's' : ''} (Bad Overcome)</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredNegative.map((habit) => {
                  const todayStr = format(todayDate, 'yyyy-MM-dd');
                  const completed = isHabitCompletedOnDate(habit.id, todayStr);
                  const isSelected = selectedHabitIds.includes(habit.id);

                  return (
                    <div
                      key={habit.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleHabitSelect(habit.id)}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">
                          {habit.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{habit.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {completed ? '1 / 1 times' : '0 / 1 times'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleLog(habit.id, todayStr)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          completed
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'border-2 border-rose-500 text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BOTTOM ACTION TOOLBAR ── */}
      <div className="fixed bottom-4 left-4 right-4 md:left-64 md:right-8 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl p-3 flex items-center justify-between z-40">
        {/* Left: Add habit shortcut */}
        <button
          onClick={() => openAddModal('good')}
          className="text-xs font-bold text-slate-700 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors"
        >
          <Plus className="w-4 h-4 text-rose-500" />
          <span>Add habit</span>
        </button>

        {/* Center: Selection counter */}
        <div className="text-xs font-semibold text-slate-500">
          {selectedHabitIds.length === 0
            ? 'Nothing selected'
            : `${selectedHabitIds.length} habit${selectedHabitIds.length > 1 ? 's' : ''} selected`}
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBatchAction('complete')}
            disabled={selectedHabitIds.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Complete</span>
          </button>

          <button
            onClick={() => handleBatchAction('skip')}
            disabled={selectedHabitIds.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Skip</span>
          </button>

          <button
            onClick={() => handleBatchAction('fail')}
            disabled={selectedHabitIds.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <XIcon className="w-3.5 h-3.5" />
            <span>Fail</span>
          </button>
        </div>
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultHabitType={modalDefaultType}
      />
    </div>
  );
}
