import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import { STATUS_OPTIONS } from '@/types/meeting.types';
import { useThemeContext } from '@/context/ThemeContext';

interface MeetingRowProps {
  meeting: Meeting;
  onStatusChange: (id: string, status: MeetingStatus) => void;
}

export function MeetingRow({ meeting: m, onStatusChange }: MeetingRowProps) {
  const { isDarkMode, theme } = useThemeContext();

  const getStatusTextColor = (status: MeetingStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'text-blue-500 dark:text-blue-400 font-semibold';
      case 'Deal Done':
        return 'text-emerald-500 dark:text-emerald-400 font-semibold';
      case 'Deal Denied':
        return 'text-rose-500 dark:text-rose-400 font-semibold';
      case 'Not attended':
        return 'text-amber-500 dark:text-amber-400 font-semibold';
      default:
        return 'text-slate-500 dark:text-zinc-400 font-semibold';
    }
  };

  return (
    <tr className={`${theme.rowHover} border-b border-slate-200 dark:border-zinc-800 transition-colors`}>
      <td className={`py-3.5 px-4 font-semibold ${theme.textMain} fira-sans-semibold whitespace-nowrap`}>
        {m.businessName}
      </td>
      <td className={`py-3.5 px-4 font-medium ${theme.textMain} whitespace-nowrap`}>
        {m.clientName}
      </td>
      <td className={`py-3.5 px-4 font-mono ${theme.textMuted} whitespace-nowrap`}>
        {m.phone}
      </td>
      <td className={`py-3.5 px-4 ${theme.textMuted} whitespace-nowrap`}>
        {m.email}
      </td>
      <td className={`py-3.5 px-4 font-medium ${theme.textMain} whitespace-nowrap`}>
        {m.ourTime}
      </td>
      <td className={`py-3.5 px-4 font-medium ${theme.textMuted} whitespace-nowrap`}>
        {m.theirTime}
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <select
          value={m.status}
          onChange={(e) => onStatusChange(m.id, e.target.value as MeetingStatus)}
          aria-label={`Status for ${m.businessName}`}
          className={`text-xs py-0.5 px-1 bg-transparent border-none focus:outline-none cursor-pointer ${getStatusTextColor(m.status)}`}
        >
          {STATUS_OPTIONS.map((st) => (
            <option
              key={st}
              value={st}
              className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6] font-normal"
            >
              {st}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
