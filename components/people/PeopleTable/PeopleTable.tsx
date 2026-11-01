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

  const getStageBadgeStyle = (stage: PersonStage) => {
    switch (stage) {
      case 'New Leads':
        return isDarkMode
          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
          : 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Contacted':
        return isDarkMode
          ? 'bg-blue-950/70 text-blue-300 border-blue-800'
          : 'bg-blue-50 text-primary border-primary/40';
      case 'Booked':
        return isDarkMode
          ? 'bg-violet-950/70 text-violet-300 border-violet-800'
          : 'bg-violet-50 text-violet-700 border-violet-300';
      case 'Follow-Up':
        return isDarkMode
          ? 'bg-amber-950/70 text-amber-300 border-amber-800'
          : 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Closed':
        return isDarkMode
          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
          : 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Denied':
        return isDarkMode
          ? 'bg-rose-950/70 text-rose-300 border-rose-800'
          : 'bg-rose-50 text-rose-700 border-rose-300';
      case 'Past Clients':
        return isDarkMode
          ? 'bg-teal-950/70 text-teal-300 border-teal-800'
          : 'bg-teal-50 text-teal-700 border-teal-300';
      default:
        return isDarkMode
          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
          : 'bg-gray-100 text-gray-700 border-gray-300';
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
              <th className="py-3 px-4 min-w-[160px]">Tags</th>
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

                    {/* Tags: Arranged horizontally, uniform clean subtle styling */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {person.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium border ${theme.border} ${theme.bgSubtle} ${theme.textMain}`}
                          >
                            <span>#{tag}</span>
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
                        <InlineTagEditor
                          existingTags={person.tags}
                          onAddTag={(tag) => onAddTag(person.id, tag)}
                        />
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

                    {/* Stage Dropdown */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={person.stage}
                        onChange={(e) => onStageChange(person.id, e.target.value as PersonStage)}
                        className={`text-xs font-semibold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${getStageBadgeStyle(
                          person.stage
                        )}`}
                      >
                        {PERSON_STAGES.map((stg) => (
                          <option key={stg} value={stg} className="bg-white text-gray-900 dark:bg-zinc-800 dark:text-zinc-100">
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
