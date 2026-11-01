import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import { MeetingRow } from './MeetingRow';
import { MeetingsFilters } from './MeetingsFilters';
import { useThemeContext } from '@/context/ThemeContext';

interface MeetingsTableProps {
  meetings: Meeting[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'All' | MeetingStatus;
  onStatusFilterChange: (status: 'All' | MeetingStatus) => void;
  onStatusChange: (id: string, status: MeetingStatus) => void;
}

export function MeetingsTable({
  meetings,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onStatusChange,
}: MeetingsTableProps) {
  const { isDarkMode, theme } = useThemeContext();

  return (
    <div className={`${theme.bgPanel} rounded-xl border ${theme.border} shadow-xs overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${theme.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-primary" />
          <h2 className={`text-base font-bold ${theme.textMain} fira-sans-bold`}>
            Booked Meetings
          </h2>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isDarkMode
                ? 'bg-blue-950/70 text-blue-300 border-blue-800'
                : 'bg-blue-50 text-primary border-primary/20'
            } border ml-1`}
          >
            {meetings.length}
          </span>
        </div>

        <MeetingsFilters
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
              <th className="py-3 px-4">Business Name</th>
              <th className="py-3 px-4">Client Name</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Our Time</th>
              <th className="py-3 px-4">Their Time</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme.border} text-xs`}>
            {meetings.length === 0 ? (
              <tr>
                <td colSpan={7} className={`py-8 text-center ${theme.textSubtle}`}>
                  No booked meetings found matching your criteria.
                </td>
              </tr>
            ) : (
              meetings.map((m) => (
                <MeetingRow key={m.id} meeting={m} onStatusChange={onStatusChange} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
