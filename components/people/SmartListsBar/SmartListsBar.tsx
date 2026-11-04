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
  const { theme, isDarkMode } = useThemeContext();

  return (
    <div className="relative">
      {/* Scroll-fade affordance on right edge */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
          isDarkMode
            ? 'bg-gradient-to-l from-[#121214] to-transparent'
            : 'bg-gradient-to-l from-[#F8FAFC] to-transparent'
        }`}
      />

      <div className={`flex items-center gap-0.5 overflow-x-auto scrollbar-none border-b ${theme.border} pr-8`}>
        {SMART_LISTS.map((list) => {
          const isSelected = selectedList === list.id;
          const count = counts[list.id] ?? 0;
          const showCount = count > 0;

          return (
            <button
              key={list.id}
              type="button"
              onClick={() => onSelectList(list.id)}
              title={list.description}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isSelected
                  ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                  : `border-transparent ${theme.textMuted} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] hover:text-[#1E293B] dark:hover:text-[#F3F4F6]`
              }`}
            >
              <span>{list.label}</span>
              {showCount && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-[#E2E8F0] dark:bg-[#2A2A32] text-[#64748B] dark:text-[#9CA3AF]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
