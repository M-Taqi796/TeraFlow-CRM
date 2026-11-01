import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode, theme } = useThemeContext();

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center gap-1.5 px-2 py-1.5 bg-transparent border-0 ${theme.textMain} hover:opacity-75 transition-opacity text-xs sm:text-sm font-medium cursor-pointer`}
      title={isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
    >
      {isDarkMode ? (
        <>
          <SunIcon className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Light</span>
        </>
      ) : (
        <>
          <MoonIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
