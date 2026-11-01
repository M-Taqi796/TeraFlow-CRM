import type { ElementType } from 'react';
import { useThemeContext } from '@/context/ThemeContext';

interface NavItemProps {
  name: string;
  icon: ElementType;
  count?: number;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export function NavItem({
  name,
  icon: Icon,
  count,
  isActive,
  isExpanded,
  onClick,
}: NavItemProps) {
  const { theme } = useThemeContext();

  return (
    <button
      onClick={onClick}
      title={!isExpanded ? name : undefined}
      className={`relative w-full flex items-center rounded-lg text-sm font-medium transition-colors ${
        isExpanded ? 'justify-between px-3.5 py-2.5' : 'justify-center p-2.5'
      } ${
        isActive
          ? 'bg-primary text-white shadow-sm'
          : `${theme.textMain} ${theme.hoverBg} hover:text-primary`
      }`}
    >
      {/* Icon + Label */}
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" />
        {isExpanded && (
          <span className="fira-sans-medium truncate">{name}</span>
        )}
      </div>

      {/* Expanded badge */}
      {isExpanded && count !== undefined && count > 0 && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isActive
              ? 'bg-white/20 text-white'
              : `${theme.bgSubtle} ${theme.textMuted}`
          }`}
        >
          {count}
        </span>
      )}

      {/* Collapsed indicator dot */}
      {!isExpanded && count !== undefined && count > 0 && (
        <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-zinc-900" />
      )}
    </button>
  );
}
