'use client';

import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import type { PersonStage } from '@/types/person.types';
import { PERSON_STAGES, COMMON_FUB_TAGS } from '@/types/person.types';
import { ColumnsCustomizer, type ColumnConfig } from '../ColumnsCustomizer/ColumnsCustomizer';

export type LastActivityFilter = 'all' | 'today' | '7days' | '30days' | 'older30';

interface PeopleFiltersProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  stageFilter: 'All' | PersonStage;
  onStageFilterChange: (stage: 'All' | PersonStage) => void;
  selectedTag: string;
  onSelectedTagChange: (tag: string) => void;
  activityFilter: LastActivityFilter;
  onActivityFilterChange: (act: LastActivityFilter) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (assignee: string) => void;
  columns: ColumnConfig[];
  onToggleColumn: (colId: string) => void;
  onResetColumns: () => void;
  onOpenNewPerson: () => void;
  onResetAllFilters: () => void;
  hasActiveFilters: boolean;
}

export function PeopleFilters({
  searchValue,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  selectedTag,
  onSelectedTagChange,
  activityFilter,
  onActivityFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  columns,
  onToggleColumn,
  onResetColumns,
  onOpenNewPerson,
  onResetAllFilters,
  hasActiveFilters,
}: PeopleFiltersProps) {
  const { theme } = useThemeContext();

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: Search + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSubtle}`}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, phone, email, company, tag..."
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} placeholder:${theme.textSubtle} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${theme.textSubtle} hover:${theme.textMain}`}
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right tools: Columns + Add Person */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <ColumnsCustomizer
            columns={columns}
            onToggleColumn={onToggleColumn}
            onResetColumns={onResetColumns}
          />

          <button
            type="button"
            onClick={onOpenNewPerson}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => onStageFilterChange(e.target.value as 'All' | PersonStage)}
          className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
        >
          <option value="All">Stage: All</option>
          {PERSON_STAGES.map((stg) => (
            <option key={stg} value={stg}>
              Stage: {stg}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={selectedTag}
          onChange={(e) => onSelectedTagChange(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
        >
          <option value="">Tag: Any</option>
          {COMMON_FUB_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              Tag: #{tag}
            </option>
          ))}
        </select>

        {/* Last Activity Filter */}
        <select
          value={activityFilter}
          onChange={(e) => onActivityFilterChange(e.target.value as LastActivityFilter)}
          className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
        >
          <option value="all">Last Activity: All</option>
          <option value="today">Activity Today</option>
          <option value="7days">Active in Last 7 Days</option>
          <option value="30days">Active in Last 30 Days</option>
          <option value="older30">No Contact &gt; 30 Days</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={assigneeFilter}
          onChange={(e) => onAssigneeFilterChange(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
        >
          <option value="all">Agent: All</option>
          <option value="Muhammad Taqi">Assigned: Muhammad Taqi</option>
          <option value="unassigned">Shared Pond / Unassigned</option>
        </select>

        {/* Clear Filters indicator */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAllFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded cursor-pointer"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
