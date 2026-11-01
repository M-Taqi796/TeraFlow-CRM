'use client';

import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import type { Person, PersonStage } from '@/types/person.types';
import { PERSON_STAGES } from '@/types/person.types';
import { InlineTagEditor } from '../InlineTagEditor/InlineTagEditor';
import type { ColumnConfig } from '../ColumnsCustomizer/ColumnsCustomizer';

interface PeopleTableProps {
  people: Person[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectPerson: (person: Person) => void;
  onStageChange: (id: string, stage: PersonStage) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  columns: ColumnConfig[];
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
  columns,
}: PeopleTableProps) {
  const { isDarkMode, theme } = useThemeContext();

  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const isAllSelected = people.length > 0 && selectedIds.length === people.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < people.length;

  const getStageBadgeStyle = (stage: PersonStage) => {
    switch (stage) {
      case 'Lead':
        return isDarkMode
          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
          : 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Contacted':
        return isDarkMode
          ? 'bg-blue-950/70 text-blue-300 border-blue-800'
          : 'bg-blue-50 text-primary border-primary/40';
      case 'Qualified':
        return isDarkMode
          ? 'bg-violet-950/70 text-violet-300 border-violet-800'
          : 'bg-violet-50 text-violet-700 border-violet-300';
      case 'Hot Prospect':
        return isDarkMode
          ? 'bg-amber-950/70 text-amber-300 border-amber-800'
          : 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Negotiation':
        return isDarkMode
          ? 'bg-orange-950/70 text-orange-300 border-orange-800'
          : 'bg-orange-50 text-orange-700 border-orange-300';
      case 'Past Client':
        return isDarkMode
          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
          : 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Trash':
        return isDarkMode
          ? 'bg-rose-950/70 text-rose-300 border-rose-800'
          : 'bg-rose-50 text-rose-700 border-rose-300';
    }
  };

  const getActivityIcon = (type: 'call' | 'email' | 'text' | 'note') => {
    switch (type) {
      case 'call':  return <PhoneIcon className="w-3.5 h-3.5 text-blue-500" />;
      case 'email': return <EnvelopeIcon className="w-3.5 h-3.5 text-amber-500" />;
      case 'text':  return <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'note':  return <DocumentTextIcon className="w-3.5 h-3.5 text-violet-500" />;
    }
  };

  const getTagColor = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes('vip')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    if (lower.includes('buyer')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    if (lower.includes('seller')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (lower.includes('investor')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    if (lower.includes('intent')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    return `${theme.bgSubtle} ${theme.textMuted} border-${theme.border}`;
  };

  return (
    <div className={`${theme.bgPanel} rounded-xl border ${theme.border} shadow-xs overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[840px]">
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

              {isColVisible('name') && <th className="py-3 px-4">Person / Contact</th>}
              {isColVisible('stage') && <th className="py-3 px-4">Stage</th>}
              {isColVisible('tags') && <th className="py-3 px-4">Tags</th>}
              {isColVisible('phone') && <th className="py-3 px-4">Phone</th>}
              {isColVisible('email') && <th className="py-3 px-4">Email</th>}
              {isColVisible('source') && <th className="py-3 px-4">Source</th>}
              {isColVisible('lastActivity') && <th className="py-3 px-4">Last Activity</th>}
              {isColVisible('dealValue') && <th className="py-3 px-4 text-right">Est. Value</th>}
              {isColVisible('assignedTo') && <th className="py-3 px-4">Assigned</th>}
              {isColVisible('createdAt') && <th className="py-3 px-4">Created</th>}
              <th className="py-3 px-3 w-10"></th>
            </tr>
          </thead>

          <tbody className={`divide-y ${theme.border} text-xs`}>
            {people.length === 0 ? (
              <tr>
                <td colSpan={12} className={`py-12 text-center ${theme.textSubtle}`}>
                  <p className="text-sm font-semibold mb-1">No people match your current filters.</p>
                  <p className="text-xs">Try selecting a different Smart List or clearing active filter chips.</p>
                </td>
              </tr>
            ) : (
              people.map((person) => {
                const isSelected = selectedIds.includes(person.id);

                return (
                  <tr
                    key={person.id}
                    className={`transition-colors cursor-pointer ${
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

                    {/* Contact Name & Business */}
                    {isColVisible('name') && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                            {person.firstName[0]}
                            {person.lastName[0]}
                          </div>
                          <div className="overflow-hidden">
                            <span className={`font-semibold ${theme.textMain} hover:text-primary transition-colors block truncate`}>
                              {person.contactName}
                            </span>
                            <span className={`text-[11px] ${theme.textSubtle} block truncate`}>
                              {person.businessName}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Stage Selector Dropdown */}
                    {isColVisible('stage') && (
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={person.stage}
                          onChange={(e) => onStageChange(person.id, e.target.value as PersonStage)}
                          className={`text-xs font-semibold py-1 px-2 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${getStageBadgeStyle(
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
                    )}

                    {/* Tags */}
                    {isColVisible('tags') && (
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {person.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${getTagColor(
                                tag
                              )}`}
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                onClick={() => onRemoveTag(person.id, tag)}
                                title="Remove tag"
                                className="hover:opacity-75 cursor-pointer"
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
                    )}

                    {/* Phone */}
                    {isColVisible('phone') && (
                      <td className={`py-3 px-4 whitespace-nowrap ${theme.textMain}`}>
                        <a
                          href={`tel:${person.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary hover:underline"
                        >
                          {person.phone}
                        </a>
                      </td>
                    )}

                    {/* Email */}
                    {isColVisible('email') && (
                      <td className={`py-3 px-4 ${theme.textMain}`}>
                        <a
                          href={`mailto:${person.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary hover:underline truncate block max-w-xs"
                        >
                          {person.email}
                        </a>
                      </td>
                    )}

                    {/* Source */}
                    {isColVisible('source') && (
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${theme.bgSubtle} border ${theme.border} ${theme.textMuted}`}>
                          {person.source}
                        </span>
                      </td>
                    )}

                    {/* Last Activity */}
                    {isColVisible('lastActivity') && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {getActivityIcon(person.lastActivity.type)}
                          <span className={`text-xs font-medium ${theme.textMain} truncate max-w-[140px]`}>
                            {person.lastActivity.relativeTime}
                          </span>
                        </div>
                        <span className={`text-[10px] ${theme.textSubtle} block truncate max-w-[160px]`}>
                          {person.lastActivity.summary}
                        </span>
                      </td>
                    )}

                    {/* Deal Value */}
                    {isColVisible('dealValue') && (
                      <td className={`py-3 px-4 text-right font-semibold ${theme.textMain}`}>
                        ${person.dealValue.toLocaleString()}
                      </td>
                    )}

                    {/* Assigned */}
                    {isColVisible('assignedTo') && (
                      <td className={`py-3 px-4 text-xs ${theme.textMuted}`}>
                        {person.assignedTo}
                      </td>
                    )}

                    {/* Created */}
                    {isColVisible('createdAt') && (
                      <td className={`py-3 px-4 text-xs ${theme.textSubtle}`}>
                        {person.createdAt}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectPerson(person)}
                        title="View details"
                        className={`p-1 rounded-md text-slate-400 hover:${theme.textMain} transition-colors`}
                      >
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </button>
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
