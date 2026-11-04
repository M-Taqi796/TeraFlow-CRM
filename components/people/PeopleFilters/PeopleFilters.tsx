'use client';

import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { PersonStage } from '@/types/person.types';
import { PERSON_STAGES, DEFAULT_NICHES, DEFAULT_CITIES } from '@/types/person.types';

interface PeopleFiltersProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  stageFilter: 'All' | PersonStage;
  onStageFilterChange: (stage: 'All' | PersonStage) => void;
  selectedTag: string;
  onSelectedTagChange: (tag: string) => void;
  selectedNiche: string;
  onSelectedNicheChange: (niche: string) => void;
  selectedCity: string;
  onSelectedCityChange: (city: string) => void;
  onResetAllFilters: () => void;
  hasActiveFilters: boolean;
}

interface ActiveChipProps {
  label: string;
  onRemove: () => void;
}

function ActiveChip({ label, onRemove }: ActiveChipProps) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/10 dark:bg-primary/15 text-primary border border-primary/20 whitespace-nowrap">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-primary/60 transition-colors ml-0.5"
        aria-label={`Remove ${label} filter`}
      >
        <XMarkIcon className="w-3 h-3" />
      </button>
    </span>
  );
}

export function PeopleFilters({
  searchValue,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  selectedTag,
  onSelectedTagChange,
  selectedNiche,
  onSelectedNicheChange,
  selectedCity,
  onSelectedCityChange,
  onResetAllFilters,
  hasActiveFilters,
}: PeopleFiltersProps) {
  const { theme, isDarkMode } = useThemeContext();
  const { allTags, customNiches, customCities } = useCRM();

  const combinedNiches = Array.from(new Set([...DEFAULT_NICHES, ...customNiches]));
  const combinedCities = Array.from(new Set([...DEFAULT_CITIES, ...customCities]));

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top row: Search + Filter dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <MagnifyingGlassIcon
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSubtle}`}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search company, person, phone, email…"
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${theme.textSubtle} hover:text-[#1E293B] dark:hover:text-[#F3F4F6] transition-colors`}
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter selects */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Stage */}
          <select
            value={stageFilter}
            onChange={(e) => onStageFilterChange(e.target.value as 'All' | PersonStage)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors focus:outline-none focus:border-primary ${
              stageFilter !== 'All'
                ? 'border-primary/40 text-primary bg-primary/5 dark:bg-primary/10'
                : `${theme.border} ${theme.bgPanel} ${theme.textMuted}`
            }`}
          >
            <option value="All">Stage</option>
            {PERSON_STAGES.map((stg) => (
              <option
                key={stg}
                value={stg}
                className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6]"
              >
                {stg}
              </option>
            ))}
          </select>

          {/* Niche */}
          <select
            value={selectedNiche}
            onChange={(e) => onSelectedNicheChange(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors focus:outline-none focus:border-primary ${
              selectedNiche
                ? 'border-primary/40 text-primary bg-primary/5 dark:bg-primary/10'
                : `${theme.border} ${theme.bgPanel} ${theme.textMuted}`
            }`}
          >
            <option value="">Niche</option>
            {combinedNiches.map((n) => (
              <option
                key={n}
                value={n}
                className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6]"
              >
                {n}
              </option>
            ))}
          </select>

          {/* City */}
          <select
            value={selectedCity}
            onChange={(e) => onSelectedCityChange(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors focus:outline-none focus:border-primary ${
              selectedCity
                ? 'border-primary/40 text-primary bg-primary/5 dark:bg-primary/10'
                : `${theme.border} ${theme.bgPanel} ${theme.textMuted}`
            }`}
          >
            <option value="">City</option>
            {combinedCities.map((c) => (
              <option
                key={c}
                value={c}
                className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6]"
              >
                {c}
              </option>
            ))}
          </select>

          {/* Tag */}
          <select
            value={selectedTag}
            onChange={(e) => onSelectedTagChange(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors focus:outline-none focus:border-primary ${
              selectedTag
                ? 'border-primary/40 text-primary bg-primary/5 dark:bg-primary/10'
                : `${theme.border} ${theme.bgPanel} ${theme.textMuted}`
            }`}
          >
            <option value="">Tag</option>
            {allTags.map((tag) => (
              <option
                key={tag}
                value={tag}
                className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6]"
              >
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button — only when active filters exist */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAllFilters}
            className={`flex items-center gap-1 text-[11px] font-semibold ${theme.textMuted} hover:text-[#1E293B] dark:hover:text-[#F3F4F6] px-2 py-1 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] cursor-pointer transition-colors`}
          >
            <FunnelIcon className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active filter chips row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {searchValue && (
            <ActiveChip label={`"${searchValue}"`} onRemove={() => onSearchChange('')} />
          )}
          {stageFilter !== 'All' && (
            <ActiveChip label={stageFilter} onRemove={() => onStageFilterChange('All')} />
          )}
          {selectedNiche && (
            <ActiveChip label={selectedNiche} onRemove={() => onSelectedNicheChange('')} />
          )}
          {selectedCity && (
            <ActiveChip label={selectedCity} onRemove={() => onSelectedCityChange('')} />
          )}
          {selectedTag && (
            <ActiveChip label={`#${selectedTag}`} onRemove={() => onSelectedTagChange('')} />
          )}
        </div>
      )}
    </div>
  );
}
