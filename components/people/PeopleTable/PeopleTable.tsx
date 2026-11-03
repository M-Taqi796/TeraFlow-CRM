'use client';

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

  const isAllSelected = people.length > 0 && selectedIds.length === people.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < people.length;

  const getStageTextColor = (stage: PersonStage) => {
    switch (stage) {
      case 'New Leads':
        return 'text-slate-500 dark:text-zinc-400 font-semibold';
      case 'Contacted':
        return 'text-blue-500 dark:text-blue-400 font-semibold';
      case 'Booked':
        return 'text-violet-600 dark:text-violet-400 font-semibold';
      case 'Follow-Up':
        return 'text-amber-500 dark:text-amber-400 font-semibold';
      case 'Closed':
        return 'text-emerald-500 dark:text-emerald-400 font-semibold';
      case 'Denied':
        return 'text-rose-500 dark:text-rose-400 font-semibold';
      case 'Past Clients':
        return 'text-teal-500 dark:text-teal-400 font-semibold';
      default:
        return 'text-slate-500 dark:text-zinc-400 font-semibold';
    }
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
              <th className="py-3 px-4 min-w-[200px]">Person / Contact</th>
              <th className="py-3 px-4 min-w-[140px]">Phone</th>
              <th className="py-3 px-4 min-w-[180px]">Email</th>
              <th className="py-3 px-4 min-w-[180px] max-w-[280px]">Tags</th>
              <th className="py-3 px-4 min-w-[200px]">Comment</th>
              <th className="py-3 px-4 min-w-[150px]">Niche</th>
              <th className="py-3 px-4 min-w-[120px]">Stage</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
            {people.length === 0 ? (
              <tr>
                <td colSpan={8} className={`py-12 text-center ${theme.textSubtle}`}>
                  <p className="text-sm font-semibold mb-1">No contacts match your current filters.</p>
                  <p className="text-xs">Try selecting a different tab or resetting search filters.</p>
                </td>
              </tr>
            ) : (
              people.map((person) => {
                const isSelected = selectedIds.includes(person.id);
                const hasPersonName = Boolean(person.contactName?.trim());
                const primaryPhone = person.phones[0] || '';
                const secondaryPhone = person.phones[1] || '';
                const primaryEmail = person.emails[0] || '';
                const secondaryEmail = person.emails[1] || '';

                return (
                  <tr
                    key={person.id}
                    className={`transition-colors cursor-pointer border-b border-slate-200 dark:border-zinc-800 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-950/20'
                          : 'bg-blue-50/50'
                        : theme.rowHover
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
                        <div className="shrink-0">
                          <InlineTagEditor
                            existingTags={person.tags}
                            onAddTag={(tag) => onAddTag(person.id, tag)}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <span className={`text-xs ${theme.textMuted} line-clamp-2 block leading-relaxed`}>
                        {person.notes || person.lastActivity?.summary || 'No comment added'}
                      </span>
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

                    {/* Stage Dropdown (No background, no border, text colored only - same as in meeting) */}
                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={person.stage}
                        onChange={(e) => onStageChange(person.id, e.target.value as PersonStage)}
                        aria-label={`Stage for ${person.businessName}`}
                        className={`text-xs py-0.5 px-1 bg-transparent border-none focus:outline-none cursor-pointer ${getStageTextColor(
                          person.stage
                        )}`}
                      >
                        {PERSON_STAGES.map((stg) => (
                          <option
                            key={stg}
                            value={stg}
                            className={
                              isDarkMode
                                ? 'bg-[#18181C] text-[#F3F4F6] font-normal'
                                : 'bg-white text-[#2C2C2C] font-normal'
                            }
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
    </div>
  );
}
