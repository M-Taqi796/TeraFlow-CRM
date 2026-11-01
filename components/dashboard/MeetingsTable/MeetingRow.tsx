import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import { STATUS_OPTIONS } from '@/types/meeting.types';
import { useThemeContext } from '@/context/ThemeContext';

interface MeetingRowProps {
  meeting: Meeting;
  onStatusChange: (id: string, status: MeetingStatus) => void;
}

export function MeetingRow({ meeting: m, onStatusChange }: MeetingRowProps) {
  const { isDarkMode, theme } = useThemeContext();

  const getStatusStyle = (status: MeetingStatus): string => {
    if (isDarkMode) {
      switch (status) {
        case 'Scheduled':    return 'bg-blue-950/70 text-blue-300 border-blue-800';
        case 'Deal Done':    return 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
        case 'Deal Denied':  return 'bg-rose-950/70 text-rose-300 border-rose-800';
        case 'Not attended': return 'bg-amber-950/70 text-amber-300 border-amber-800';
        default:             return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      }
    }
    switch (status) {
      case 'Scheduled':    return 'bg-blue-50 text-primary border-primary/25';
      case 'Deal Done':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Deal Denied':  return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Not attended': return 'bg-amber-50 text-amber-700 border-amber-200';
      default:             return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <tr className={`${theme.rowHover} transition-colors`}>
      <td className={`py-3.5 px-4 font-semibold ${theme.textMain} fira-sans-semibold`}>
        {m.businessName}
      </td>
      <td className={`py-3.5 px-4 font-medium ${theme.textMain}`}>
        {m.clientName}
      </td>
      <td className={`py-3.5 px-4 font-mono ${theme.textMuted} whitespace-nowrap`}>
        {m.phone}
      </td>
      <td className={`py-3.5 px-4 ${theme.textMuted}`}>
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
          className={`text-xs font-semibold py-1 px-2.5 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${getStatusStyle(m.status)}`}
        >
          {STATUS_OPTIONS.map((st) => (
            <option
              key={st}
              value={st}
              className={
                isDarkMode
                  ? 'bg-[#18181C] text-[#F3F4F6] font-normal'
                  : 'bg-white text-[#2C2C2C] font-normal'
              }
            >
              {st}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
