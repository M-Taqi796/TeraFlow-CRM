'use client';

import {
  MagnifyingGlassIcon,
  XMarkIcon,
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
  const { theme } = useThemeContext();
  const { allTags, customNiches, customCities } = useCRM();

  const combinedNiches = Array.from(new Set([...DEFAULT_NICHES, ...customNiches]));
  const combinedCities = Array.from(new Set([...DEFAULT_CITIES, ...customCities]));

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: Clean Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <MagnifyingGlassIcon
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSubtle}`}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search company, person, phone, email, niche, city..."
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
      </div>

      {/* Filter Row: Stages, Niches, Cities, Tags, and Reset */}
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

        {/* Niche Filter */}
        <select
          value={selectedNiche}
          onChange={(e) => onSelectedNicheChange(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
        >
          <option value="">Niche: All</option>
          {combinedNiches.map((n) => (
            <option key={n} value={n}>
              Niche: {n}
            </option>
          ))}
        </select>

        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={(e) => onSelectedCityChange(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
        >
          <option value="">City: All</option>
          {combinedCities.map((c) => (
            <option key={c} value={c}>
              City: {c}
            </option>
          ))}
        </select>

        {/* Tag Filter (clean, no #) */}
        <select
          value={selectedTag}
          onChange={(e) => onSelectedTagChange(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
        >
          <option value="">Tag: Any</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              Tag: {tag}
            </option>
          ))}
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
