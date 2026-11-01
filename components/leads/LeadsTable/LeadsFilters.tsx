import { FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { LeadStage, LeadPriority } from '@/types/lead.types';
import { LEAD_STAGES, LEAD_PRIORITIES } from '@/types/lead.types';
import { useThemeContext } from '@/context/ThemeContext';

interface LeadsFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  stageFilter: 'All' | LeadStage;
  onStageFilterChange: (stage: 'All' | LeadStage) => void;
  priorityFilter: 'All' | LeadPriority;
  onPriorityFilterChange: (priority: 'All' | LeadPriority) => void;
  onOpenNewLead: () => void;
}

export function LeadsFilters({
  searchValue,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onOpenNewLead,
}: LeadsFiltersProps) {
  const { isDarkMode, theme } = useThemeContext();

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 sm:flex-initial">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search leads, contacts, emails..."
          className={`pl-3 pr-7 py-1.5 ${theme.inputBg} border ${theme.inputBorder} rounded-lg text-xs ${theme.textMain} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-56 transition-all placeholder:${theme.textSubtle}`}
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${theme.textSubtle} hover:${theme.textMain} text-sm font-semibold`}
          >
            ×
          </button>
        )}
      </div>

      {/* Stage Filter */}
      <div className={`flex items-center gap-1 ${theme.inputBg} p-1 border ${theme.inputBorder} rounded-lg shrink-0`}>
        <FunnelIcon className={`w-3.5 h-3.5 ${theme.textSubtle} ml-1`} />
        <select
          value={stageFilter}
          onChange={(e) => onStageFilterChange(e.target.value as 'All' | LeadStage)}
          aria-label="Filter leads by stage"
          className={`bg-transparent text-xs ${theme.textMain} font-medium focus:outline-none pr-1 cursor-pointer`}
        >
          <option
            value="All"
            className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}
          >
            All Stages
          </option>
          {LEAD_STAGES.map((st) => (
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

      {/* Priority Filter */}
      <div className={`flex items-center gap-1 ${theme.inputBg} p-1 border ${theme.inputBorder} rounded-lg shrink-0`}>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value as 'All' | LeadPriority)}
          aria-label="Filter leads by priority"
          className={`bg-transparent text-xs ${theme.textMain} font-medium focus:outline-none px-1 cursor-pointer`}
        >
          <option
            value="All"
            className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}
          >
            All Priorities
          </option>
          {LEAD_PRIORITIES.map((p) => (
            <option
              key={p}
              value={p}
              className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}
            >
              {p} Priority
            </option>
          ))}
        </select>
      </div>

      {/* Add Lead Button */}
      <button
        id="btn-add-lead"
        onClick={onOpenNewLead}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs shrink-0 cursor-pointer"
      >
        <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Add Lead</span>
      </button>
    </div>
  );
}
