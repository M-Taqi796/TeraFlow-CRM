import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import type { TimePeriod } from '@/types/metrics.types';
import { TIME_PERIODS } from '@/data/metrics.data';
import { useThemeContext } from '@/context/ThemeContext';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  ariaLabel: string;
}

export function MetricCard({
  label,
  value,
  change,
  period,
  onPeriodChange,
  ariaLabel,
}: MetricCardProps) {
  const { isDarkMode, theme } = useThemeContext();

  // Detect negative change — starts with "-" or contains "−"
  const isNegative = change.trim().startsWith('-') || change.trim().startsWith('−');

  return (
    <div
      className={`p-5 ${theme.bgPanel} rounded-xl border ${theme.border} shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between`}
    >
      {/* Header: Label + Period Selector */}
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${theme.textSubtle} uppercase tracking-wider fira-sans-medium`}>
          {label}
        </p>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
          aria-label={ariaLabel}
          className={`text-xs font-medium ${theme.textMain} ${theme.bgSubtle} border ${theme.border} rounded-md pl-2.5 pr-7 py-1 focus:outline-none focus:border-primary cursor-pointer transition-colors select-compact`}
        >
          {TIME_PERIODS.map((p) => (
            <option
              key={p}
              value={p}
              className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6]"
            >
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Value + Change */}
      <div className="mt-4">
        <p className={`text-3xl font-bold ${theme.textMain} fira-sans-bold tracking-tight`}>
          {value}
        </p>
        <div className={`mt-3 flex items-center text-xs pt-3 border-t ${theme.border}`}>
          {isNegative ? (
            <span className="font-semibold text-rose-500 flex items-center gap-1">
              <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
              {change}
            </span>
          ) : (
            <span className="font-semibold text-emerald-500 flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
