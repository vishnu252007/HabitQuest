import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Wand2,
  Repeat,
  Target,
  Sun,
  Calendar,
  Slash,
  Bell,
  Folder,
  X,
  Clock,
} from 'lucide-react';
import { useHabitStore, type CreateHabitForm } from '../store/habitStore';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHabitType?: 'good' | 'bad';
}

const GOOD_MAGIC_SAMPLES: Partial<CreateHabitForm>[] = [
  { name: 'Drink 8 Glasses of Water', category: 'health', emoji: '💧', color: '#06b6d4', point_value: 10, description: 'Stay hydrated throughout the day' },
  { name: 'Morning 30-min Exercise', category: 'fitness', emoji: '🏃', color: '#ef4444', point_value: 25, description: 'Cardio or strength training' },
  { name: 'Read 15 Pages of Book', category: 'learning', emoji: '📚', color: '#8b5cf6', point_value: 15, description: 'Expand your knowledge daily' },
  { name: '10-min Mindfulness Meditation', category: 'mindfulness', emoji: '🧘', color: '#14b8a6', point_value: 20, description: 'Calm mind and focus' },
];

const BAD_MAGIC_SAMPLES: Partial<CreateHabitForm>[] = [
  { name: 'Stop Late Night Screen Time', category: 'health', emoji: '🚫', color: '#ef4444', point_value: 20, description: 'No screens 1 hour before bed' },
  { name: 'Avoid Junk Food & Soda', category: 'health', emoji: '🥗', color: '#f59e0b', point_value: 25, description: 'Eat clean whole foods' },
  { name: 'Limit Social Media scrolling', category: 'productivity', emoji: '⏳', color: '#8b5cf6', point_value: 15, description: 'Max 30 mins per day' },
  { name: 'No Smoking / Vaping', category: 'health', emoji: '🚭', color: '#dc2626', point_value: 30, description: 'Keep lungs clean and healthy' },
];

export default function AddHabitModal({ isOpen, onClose, defaultHabitType = 'good' }: AddHabitModalProps) {
  const { addHabit } = useHabitStore();
  const [activeTab, setActiveTab] = useState<'new' | 'quit'>(
    defaultHabitType === 'bad' ? 'quit' : 'new'
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repeatType, setRepeatType] = useState('Daily');
  const [repeatFreq, setRepeatFreq] = useState('Every Day');
  const [goalAmount, setGoalAmount] = useState('1');
  const [goalUnit, setGoalUnit] = useState('times');
  const [goalPeriod, setGoalPeriod] = useState('per day');
  const [timesOfDay, setTimesOfDay] = useState<{ morning: boolean; afternoon: boolean; evening: boolean }>({
    morning: true,
    afternoon: true,
    evening: true,
  });
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endCondition, setEndCondition] = useState('Never');
  const [reminderOffset, setReminderOffset] = useState('20_mins_before');
  const [reminders, setReminders] = useState<string[]>(['08:40 AM (20m before)']);
  const [area, setArea] = useState('health');
  const [emoji, setEmoji] = useState('💪');
  const [color, setColor] = useState('#2563eb');
  const [pointValue, setPointValue] = useState(15);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBadHabit = activeTab === 'quit';

  const handleMagicFill = () => {
    const samples = isBadHabit ? BAD_MAGIC_SAMPLES : GOOD_MAGIC_SAMPLES;
    const picked = samples[Math.floor(Math.random() * samples.length)];
    if (picked.name) setName(picked.name);
    if (picked.description) setDescription(picked.description);
    if (picked.category) setArea(picked.category);
    if (picked.emoji) setEmoji(picked.emoji);
    if (picked.color) setColor(picked.color);
    if (picked.point_value) setPointValue(picked.point_value);
  };

  const handleAddReminder = () => {
    const timePrompt = prompt('Enter reminder time (e.g. 08:40 AM or 20 mins before):', '20 mins before');
    if (timePrompt) {
      setReminders((prev) => [...prev, timePrompt]);
    }
  };

  const handleRemoveReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Habit name is required' });
      return;
    }

    setIsSubmitting(true);

    const habitForm: CreateHabitForm = {
      name: name.trim(),
      description: description.trim() || (isBadHabit ? 'Overcome bad habit' : 'Daily healthy habit'),
      category: isBadHabit ? 'bad_habit' : area,
      frequency: `${repeatType.toLowerCase()}_${repeatFreq.toLowerCase().replace(/\s+/g, '_')}`,
      point_value: pointValue,
      color: isBadHabit ? '#ef4444' : color,
      emoji: isBadHabit ? '🚫' : emoji,
    };

    await addHabit(habitForm);

    // Request Web Notification permission if supported
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-xl border border-slate-200/80 shadow-2xl overflow-hidden font-sans text-slate-800"
          >
            {/* Header Tabs with Fitbit & Strava removed */}
            <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => { setActiveTab('new'); setEmoji('💪'); setColor('#2563eb'); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'new'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                New Habit
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('quit'); setEmoji('🚫'); setColor('#ef4444'); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'quit'
                    ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Quit Bad Habit
              </button>

              <button
                type="button"
                onClick={onClose}
                className="ml-auto p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="divide-y divide-slate-100 text-xs">
              {/* Top Name Row with Magic Fill */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-sky-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors({}); }}
                    placeholder={isBadHabit ? 'Enter Bad Habit to Quit (e.g. Smoking, Junk Food)' : 'Enter Habit Name'}
                    className="w-full text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={handleMagicFill}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-100 transition-all flex-shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Magic Fill
                </button>
              </div>
              {errors.name && (
                <p className="px-4 pb-2 text-[11px] text-rose-500 font-medium">{errors.name}</p>
              )}

              {/* Repeat Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 font-bold w-1/3">
                  <Repeat className="w-4 h-4 text-slate-700" />
                  <span>Repeat</span>
                </div>
                <div className="flex items-center gap-2 w-2/3 justify-end">
                  <select
                    value={repeatType}
                    onChange={(e) => setRepeatType(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <select
                    value={repeatFreq}
                    onChange={(e) => setRepeatFreq(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Every Day">Every Day</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                  </select>
                </div>
              </div>

              {/* Goal Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 font-bold w-1/3">
                  <Target className="w-4 h-4 text-slate-700" />
                  <span>Goal</span>
                </div>
                <div className="flex items-center gap-2 w-2/3 justify-end">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="w-16 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 text-center focus:outline-none focus:border-blue-600"
                  />
                  <select
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600"
                  >
                    <option value="times">times</option>
                    <option value="hours">hours</option>
                    <option value="mins">mins</option>
                  </select>
                  <select
                    value={goalPeriod}
                    onChange={(e) => setGoalPeriod(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600"
                  >
                    <option value="per day">per day</option>
                    <option value="per week">per week</option>
                  </select>
                </div>
              </div>

              {/* Time of Day Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 font-bold w-1/3">
                  <Sun className="w-4 h-4 text-slate-700" />
                  <span>Time of Day</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timesOfDay.morning}
                      onChange={(e) => setTimesOfDay({ ...timesOfDay, morning: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span>Morning</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timesOfDay.afternoon}
                      onChange={(e) => setTimesOfDay({ ...timesOfDay, afternoon: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span>Afternoon</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timesOfDay.evening}
                      onChange={(e) => setTimesOfDay({ ...timesOfDay, evening: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <span>Evening</span>
                  </label>
                </div>
              </div>

              {/* Start Date Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 font-bold w-1/3">
                  <Calendar className="w-4 h-4 text-slate-700" />
                  <span>Start Date</span>
                </div>
                <div className="w-2/3 flex justify-end">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* End Condition Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 font-bold w-1/3">
                  <Slash className="w-4 h-4 text-slate-700" />
                  <span>End Condition</span>
                </div>
                <div className="w-2/3 flex justify-end">
                  <select
                    value={endCondition}
                    onChange={(e) => setEndCondition(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600 w-full max-w-[200px]"
                  >
                    <option value="Never">Never</option>
                    <option value="On Date">On Date</option>
                    <option value="After 30 Times">After 30 Times</option>
                  </select>
                </div>
              </div>

              {/* Reminders Row with 20-min Pre-alert option */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-800 font-bold">
                    <Bell className="w-4 h-4 text-rose-500" />
                    <span>Habit Reminders</span>
                  </div>
                  <select
                    value={reminderOffset}
                    onChange={(e) => {
                      setReminderOffset(e.target.value);
                      if (e.target.value === '20_mins_before') {
                        setReminders((prev) => [...prev, '20 mins before habit']);
                      }
                    }}
                    className="bg-rose-50 text-rose-700 font-bold border border-rose-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="20_mins_before">⏰ Alert 20 Mins Before (Recommended)</option>
                    <option value="15_mins_before">⏰ Alert 15 Mins Before</option>
                    <option value="30_mins_before">⏰ Alert 30 Mins Before</option>
                    <option value="exact_time">🔔 Alert at Exact Time</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {reminders.map((rem, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{rem}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveReminder(idx)}
                        className="text-rose-400 hover:text-rose-700 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddReminder}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold px-3 py-1.5 rounded-xl hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    + Custom Reminder
                  </button>
                </div>
              </div>

              {/* Area / Category Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 font-bold w-1/3">
                  <Folder className="w-4 h-4 text-slate-700" />
                  <span>Area</span>
                </div>
                <div className="w-2/3 flex justify-end">
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-600 capitalize w-full max-w-[200px]"
                  >
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="learning">Learning</option>
                    <option value="productivity">Productivity</option>
                    <option value="bad_habit">Bad Habit</option>
                  </select>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50/50 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                    isBadHabit ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    'Save Habit & Set Reminder'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
