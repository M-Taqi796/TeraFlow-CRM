import type { ElementType } from 'react';
import Link from 'next/link';
import { useThemeContext } from '@/context/ThemeContext';

interface NavItemProps {
  name: string;
  href: string;
  icon: ElementType;
  count?: number;
  hasUnread?: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

export function NavItem({
  name,
  href,
  icon: Icon,
  hasUnread = false,
  isActive,
  isExpanded,
  onClick,
}: NavItemProps) {
  const { theme } = useThemeContext();

  return (
    <Link
      href={href}
      onClick={onClick}
      title={!isExpanded ? name : undefined}
      className={`relative w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
        isExpanded ? 'justify-between px-3.5 py-2.5' : 'justify-center p-2.5'
      } ${
        isActive
          ? 'bg-primary/10 dark:bg-primary/15 text-primary'
          : `${theme.textMuted} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] hover:text-[#1E293B] dark:hover:text-[#F3F4F6]`
      }`}
    >
      {/* Active left-side accent bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
      )}

      {/* Icon + Label */}
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : ''}`} />
        {isExpanded && (
          <span className="fira-sans-medium truncate">{name}</span>
        )}
      </div>

      {/* Expanded blue dot indicator — shown only if unread */}
      {isExpanded && hasUnread && (
        <span
          className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/25 shrink-0 animate-pulse"
          aria-label="New unread activity"
        />
      )}

      {/* Collapsed blue dot indicator — shown only if unread */}
      {!isExpanded && hasUnread && (
        <span
          className="absolute right-2 top-2 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-[#18181C]"
          aria-label="New unread activity"
        />
      )}
    </Link>
  );
}
