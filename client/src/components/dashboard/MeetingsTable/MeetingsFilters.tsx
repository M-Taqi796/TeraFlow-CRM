import { FunnelIcon } from '@heroicons/react/24/outline';
import type { MeetingStatus } from '../../../types/meeting.types';
import { STATUS_OPTIONS } from '../../../types/meeting.types';
import { useThemeContext } from '../../../context/ThemeContext';

interface MeetingsFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'All' | MeetingStatus;
  onStatusFilterChange: (status: 'All' | MeetingStatus) => void;
}

export function MeetingsFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: MeetingsFiltersProps) {
  const { isDarkMode, theme } = useThemeContext();

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 sm:flex-initial">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search meetings..."
          className={`pl-3 pr-6 py-1.5 ${theme.inputBg} border ${theme.inputBorder} rounded-lg text-xs ${theme.textMain} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-44 transition-all placeholder:${theme.textSubtle}`}
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${theme.textSubtle} hover:${theme.textMain} text-xs`}
          >
            ×
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className={`flex items-center gap-1 ${theme.inputBg} p-1 border ${theme.inputBorder} rounded-lg shrink-0`}>
        <FunnelIcon className={`w-3.5 h-3.5 ${theme.textSubtle} ml-1`} />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as 'All' | MeetingStatus)}
          aria-label="Filter meetings by status"
          className={`bg-transparent text-xs ${theme.textMain} font-medium focus:outline-none pr-1 cursor-pointer`}
        >
          <option
            value="All"
            className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}
          >
            All Statuses
          </option>
          {STATUS_OPTIONS.map((st) => (
            <option
              key={st}
              value={st}
              className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}
            >
              {st}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
