'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import type { Person, PersonStage } from '@/types/person.types';
import { PERSON_STAGES } from '@/types/person.types';
import { InlineTagEditor } from '../InlineTagEditor/InlineTagEditor';

interface PeopleTableProps {
  people: Person[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectPerson: (person: Person) => void;
  onStageChange: (id: string, stage: PersonStage) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}

type SortField = 'businessName' | 'niche' | 'stage';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE = 25;

export function PeopleTable({
  people,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onSelectPerson,
  onStageChange,
  onAddTag,
  onRemoveTag,
}: PeopleTableProps) {
  const { isDarkMode, theme } = useThemeContext();

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the incoming dataset changes length
  useEffect(() => {
    setCurrentPage(1);
  }, [people.length]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedPeople = useMemo(() => {
    if (!sortField) return people;
    return [...people].sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortField === 'businessName') {
        valA = a.businessName || '';
        valB = b.businessName || '';
      } else if (sortField === 'niche') {
        valA = a.niche || '';
        valB = b.niche || '';
      } else if (sortField === 'stage') {
        valA = a.stage || '';
        valB = b.stage || '';
      }
      const cmp = valA.localeCompare(valB);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [people, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedPeople.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedPeople = sortedPeople.slice(startIndex, startIndex + PAGE_SIZE);

  const isAllSelected = people.length > 0 && selectedIds.length === people.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < people.length;

  const getStageTextColor = (stage: PersonStage): string => {
    switch (stage) {
      case 'New Leads':     return 'text-slate-500 dark:text-zinc-400 font-semibold';
      case 'Contacted':     return 'text-blue-600 dark:text-blue-400 font-semibold';
      case 'Booked':        return 'text-violet-600 dark:text-violet-400 font-semibold';
      case 'Follow-Up':     return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'Closed':        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'Denied':        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'Past Clients':  return 'text-teal-600 dark:text-teal-400 font-semibold';
      default:              return 'text-slate-500 dark:text-zinc-400 font-semibold';
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUpDownIcon className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
    ) : (
      <ChevronDownIcon className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
    );
  };

  return (
    <div className={`${theme.bgPanel} rounded-xl border ${theme.border} shadow-xs overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
              {/* Checkbox */}
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                />
              </th>

              {/* Required Columns */}
              <th
                onClick={() => handleSort('businessName')}
                className="py-3 px-4 min-w-[200px] cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5 hover:text-[#1E293B] dark:hover:text-[#F3F4F6] transition-colors">
                  <span>Person / Contact</span>
                  {renderSortIcon('businessName')}
                </div>
              </th>
              <th className="py-3 px-4 min-w-[140px]">Phone</th>
              <th className="py-3 px-4 min-w-[180px]">Email</th>
              <th className="py-3 px-4 min-w-[180px] max-w-[280px]">Tags</th>
              <th className="py-3 px-4 min-w-[200px]">Comment</th>
              <th
                onClick={() => handleSort('niche')}
                className="py-3 px-4 min-w-[150px] cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5 hover:text-[#1E293B] dark:hover:text-[#F3F4F6] transition-colors">
                  <span>Niche</span>
                  {renderSortIcon('niche')}
                </div>
              </th>
              <th
                onClick={() => handleSort('stage')}
                className="py-3 px-4 min-w-[120px] cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5 hover:text-[#1E293B] dark:hover:text-[#F3F4F6] transition-colors">
                  <span>Stage</span>
                  {renderSortIcon('stage')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
            {paginatedPeople.length === 0 ? (
              <tr>
                <td colSpan={8} className={`py-12 text-center ${theme.textSubtle}`}>
                  <p className="text-sm font-semibold mb-1">No contacts match your current filters.</p>
                  <p className="text-xs">Try selecting a different tab or resetting search filters.</p>
                </td>
              </tr>
            ) : (
              paginatedPeople.map((person) => {
                const isSelected = selectedIds.includes(person.id);
                const hasPersonName = Boolean(person.contactName?.trim());
                const primaryPhone = person.phones[0] || '';
                const secondaryPhone = person.phones[1] || '';
                const primaryEmail = person.emails[0] || '';
                const secondaryEmail = person.emails[1] || '';

                return (
                  <tr
                    key={person.id}
                    className={`group transition-colors cursor-pointer border-b border-slate-200 dark:border-zinc-800 ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/20'
                        : 'hover:bg-[#F0F8FE] dark:hover:bg-[#202028]'
                    }`}
                    onClick={() => onSelectPerson(person)}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 px-3.5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(person.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(person.id)}
                        className="rounded text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                      />
                    </td>

                    {/* Person / Contact: Company on Top, Person Name Underneath */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col justify-center">
                        <span className={`font-bold ${theme.textMain} hover:text-primary transition-colors text-sm leading-snug truncate`}>
                          {person.businessName}
                        </span>
                        {hasPersonName && (
                          <span className={`text-xs ${theme.textMuted} font-medium leading-tight truncate`}>
                            {person.contactName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phone (can have multiple) */}
                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {primaryPhone ? (
                        <div className="flex flex-col gap-0.5">
                          <a
                            href={`tel:${primaryPhone}`}
                            className={`font-medium ${theme.textMain} hover:text-primary hover:underline block`}
                          >
                            {primaryPhone}
                          </a>
                          {secondaryPhone && (
                            <a
                              href={`tel:${secondaryPhone}`}
                              className={`text-[11px] ${theme.textSubtle} hover:text-primary hover:underline block`}
                            >
                              {secondaryPhone}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className={theme.textSubtle}>&mdash;</span>
                      )}
                    </td>

                    {/* Email (can have multiple) */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      {primaryEmail ? (
                        <div className="flex flex-col gap-0.5 max-w-[200px]">
                          <a
                            href={`mailto:${primaryEmail}`}
                            className={`font-medium ${theme.textMain} hover:text-primary hover:underline truncate block`}
                          >
                            {primaryEmail}
                          </a>
                          {secondaryEmail && (
                            <a
                              href={`mailto:${secondaryEmail}`}
                              className={`text-[11px] ${theme.textSubtle} hover:text-primary hover:underline truncate block`}
                            >
                              {secondaryEmail}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className={theme.textSubtle}>&mdash;</span>
                      )}
                    </td>

                    {/* Tags: Horizontally scrollable on hover, no # symbol */}
                    <td className="py-3 px-4 max-w-[280px]" onClick={(e) => e.stopPropagation()}>
                      <div
                        className="flex items-center gap-1.5 overflow-x-auto max-w-[260px] py-1 tags-scroll-container"
                        onWheel={(e) => {
                          if (e.deltaY !== 0 && e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
                            e.currentTarget.scrollLeft += e.deltaY;
                          }
                        }}
                      >
                        {person.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`shrink-0 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium border ${theme.border} ${theme.bgSubtle} ${theme.textMain} whitespace-nowrap`}
                          >
                            <span>{tag.replace(/^#/, '')}</span>
                            <button
                              type="button"
                              onClick={() => onRemoveTag(person.id, tag)}
                              title="Remove tag"
                              className="hover:opacity-75 cursor-pointer ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        {/* + Tag button: only visible on row hover (group-hover) */}
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <InlineTagEditor
                            existingTags={person.tags}
                            onAddTag={(tag) => onAddTag(person.id, tag)}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="py-3 px-4 max-w-[220px]">
                      {person.notes || person.lastActivity?.summary ? (
                        <span className={`text-xs ${theme.textMuted} line-clamp-2 block leading-relaxed`}>
                          {person.notes || person.lastActivity?.summary}
                        </span>
                      ) : (
                        <span className={`text-xs ${theme.textSubtle}`}>&mdash;</span>
                      )}
                    </td>

                    {/* Niche: Niche + City */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-semibold ${theme.textMain}`}>
                          {person.niche || 'General'}
                        </span>
                        {person.city && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${theme.border} ${theme.bgSubtle} ${theme.textSubtle} font-medium`}>
                            {person.city}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stage — simple colored text with native select */}
                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={person.stage}
                        onChange={(e) => onStageChange(person.id, e.target.value as PersonStage)}
                        aria-label={`Stage for ${person.businessName}`}
                        className={`text-xs py-0.5 px-0 bg-transparent border-none focus:outline-none cursor-pointer ${getStageTextColor(person.stage)}`}
                      >
                        {PERSON_STAGES.map((stg) => (
                          <option
                            key={stg}
                            value={stg}
                            className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6] font-normal"
                          >
                            {stg}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedPeople.length > 0 && (
        <div className={`px-4 py-3 border-t ${theme.border} ${theme.bgSubtle} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs`}>
          <div className={theme.textMuted}>
            Showing <span className={`font-semibold ${theme.textMain}`}>{startIndex + 1}</span> to{' '}
            <span className={`font-semibold ${theme.textMain}`}>
              {Math.min(startIndex + PAGE_SIZE, sortedPeople.length)}
            </span>{' '}
            of <span className={`font-semibold ${theme.textMain}`}>{sortedPeople.length}</span> contacts
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} font-medium transition-colors ${
                  safeCurrentPage === 1
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : `cursor-pointer ${theme.textMain} hover:border-primary/40 hover:bg-[#F1F5F9] dark:hover:bg-[#25252D]`
                }`}
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safeCurrentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && page - prev > 1;
                    return (
                      <span key={page} className="flex items-center gap-1">
                        {hasGap && <span className={`px-1 ${theme.textSubtle}`}>…</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                            page === safeCurrentPage
                              ? 'bg-primary text-white shadow-xs'
                              : `${theme.textMuted} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] hover:text-[#1E293B] dark:hover:text-[#F3F4F6]`
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} font-medium transition-colors ${
                  safeCurrentPage === totalPages
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : `cursor-pointer ${theme.textMain} hover:border-primary/40 hover:bg-[#F1F5F9] dark:hover:bg-[#25252D]`
                }`}
              >
                <span>Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
