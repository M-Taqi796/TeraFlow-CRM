'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { toggleDarkMode, theme } = useThemeContext();

  return (
    <button
      suppressHydrationWarning
      onClick={toggleDarkMode}
      className={`flex items-center gap-1.5 px-2 py-1.5 bg-transparent border-0 ${theme.textMain} hover:opacity-75 transition-opacity text-xs sm:text-sm font-medium cursor-pointer`}
      title="Toggle Light / Dark mode"
    >
      {/* Shown in dark mode via pure CSS */}
      <span className="hidden dark:inline-flex items-center gap-1.5">
        <SunIcon className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Light</span>
      </span>
      {/* Shown in light mode via pure CSS */}
      <span className="inline-flex dark:hidden items-center gap-1.5">
        <MoonIcon className="w-4 h-4 text-gray-500 shrink-0" />
        <span>Dark</span>
      </span>
    </button>
  );
}
