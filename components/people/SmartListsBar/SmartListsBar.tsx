'use client';

import { useThemeContext } from '@/context/ThemeContext';
import type { SmartListId } from '@/types/person.types';
import { SMART_LISTS } from '@/types/person.types';

interface SmartListsBarProps {
  selectedList: SmartListId;
  onSelectList: (id: SmartListId) => void;
  counts: Record<SmartListId, number>;
}

export function SmartListsBar({
  selectedList,
  onSelectList,
  counts,
}: SmartListsBarProps) {
  const { theme } = useThemeContext();

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b ${theme.border}`}>
      {SMART_LISTS.map((list) => {
        const isSelected = selectedList === list.id;
        const count = counts[list.id] ?? 0;

        return (
          <button
            key={list.id}
            onClick={() => onSelectList(list.id)}
            title={list.description}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              isSelected
                ? 'border-primary text-primary bg-primary/5'
                : `border-transparent ${theme.textMuted} hover:${theme.textMain} hover:bg-black/5 dark:hover:bg-white/5`
            }`}
          >
            <span>{list.label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                isSelected
                  ? 'bg-primary text-white'
                  : `${theme.bgSubtle} ${theme.textSubtle} border ${theme.border}`
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
