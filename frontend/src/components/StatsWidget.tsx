import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatsWidgetProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'purple' | 'teal' | 'amber' | 'emerald' | 'rose' | 'blue';
  delay?: number;
}

const colorMap = {
  blue: {
    bg: '#eff6ff',
    border: '#dbeafe',
    iconColor: '#2563eb',
  },
  purple: {
    bg: '#faf5ff',
    border: '#f3e8ff',
    iconColor: '#7c3aed',
  },
  teal: {
    bg: '#f0fdf4',
    border: '#dcfce7',
    iconColor: '#0d9488',
  },
  amber: {
    bg: '#fffbeb',
    border: '#fef3c7',
    iconColor: '#d97706',
  },
  emerald: {
    bg: '#ecfdf5',
    border: '#d1fae5',
    iconColor: '#059669',
  },
  rose: {
    bg: '#fff1f2',
    border: '#ffe4e6',
    iconColor: '#e11d48',
  },
};

export default function StatsWidget({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'blue',
  delay = 0,
}: StatsWidgetProps) {
  const scheme = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card-light p-4 flex items-center justify-between"
    >
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900 leading-none mb-1">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-slate-500 font-medium">
            {subtext}
          </p>
        )}
      </div>

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: scheme.bg, border: `1px solid ${scheme.border}` }}
      >
        <Icon className="w-5 h-5" style={{ color: scheme.iconColor }} />
      </div>
    </motion.div>
  );
}
