import type { TimePeriod } from '@/types/metrics.types';
import { METRICS_DATA, TIME_PERIODS } from '@/data/metrics.data';
import { useThemeContext } from '@/context/ThemeContext';

interface DonutChartProps {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function DonutChart({ period, onPeriodChange }: DonutChartProps) {
  const { isDarkMode, theme } = useThemeContext();
  const data = METRICS_DATA[period].chart;

  const total = data.totalCalls + data.bookedMeetings;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const meetingsOffset = (data.bookedMeetings / total) * circumference;
  const callsOffset = circumference - meetingsOffset;

  const callsPercent = Math.round((data.totalCalls / total) * 100);
  const meetingsPercent = Math.round((data.bookedMeetings / total) * 100);

  return (
    <div
      className={`p-5 ${theme.bgPanel} rounded-xl border ${theme.border} shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${theme.textSubtle} uppercase tracking-wider fira-sans-medium`}>
          Calls vs Booked Meetings
        </p>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
          aria-label="Conversion chart time period"
          className={`text-xs font-medium ${theme.textMain} ${theme.bgSubtle} border ${theme.border} rounded-md px-2 py-1 focus:outline-none cursor-pointer`}
        >
          {TIME_PERIODS.map((p) => (
            <option
              key={p}
              value={p}
              className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}
            >
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Chart + Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mt-2">
        {/* SVG Donut */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Track */}
            <circle
              cx="50" cy="50" r={radius} fill="transparent"
              stroke={isDarkMode ? '#282832' : '#E5E7EB'}
              strokeWidth="13"
            />
            {/* Calls arc */}
            <circle
              cx="50" cy="50" r={radius} fill="transparent"
              stroke="#007DDC" strokeWidth="13"
              strokeDasharray={`${callsOffset} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            {/* Meetings arc */}
            <circle
              cx="50" cy="50" r={radius} fill="transparent"
              stroke="#10B981" strokeWidth="13"
              strokeDasharray={`${meetingsOffset} ${circumference}`}
              strokeDashoffset={-callsOffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-base font-bold ${theme.textMain} leading-none`}>
              {data.conversionRate}
            </span>
            <span className={`text-[10px] ${theme.textSubtle} font-medium mt-0.5`}>
              Booked
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2 text-xs">
          <div className={`p-2 rounded-lg ${theme.bgSubtle} border ${theme.border} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              <span className={`font-medium ${theme.textMain}`}>Total Calls</span>
            </div>
            <div className="text-right">
              <span className={`font-bold ${theme.textMain}`}>{data.totalCalls}</span>
              <span className={`text-[11px] ${theme.textSubtle} ml-1.5`}>({callsPercent}%)</span>
            </div>
          </div>

          <div className={`p-2 rounded-lg ${theme.bgSubtle} border ${theme.border} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className={`font-medium ${theme.textMain}`}>Booked Meetings</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.bookedMeetings}</span>
              <span className={`text-[11px] ${theme.textSubtle} ml-1.5`}>({meetingsPercent}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
