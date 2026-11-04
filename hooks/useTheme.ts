'use client';

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  bgApp: string;
  bgPanel: string;
  bgSubtle: string;
  border: string;
  divide: string;
  textMain: string;
  textMuted: string;
  textSubtle: string;
  inputBg: string;
  inputBorder: string;
  hoverBg: string;
  rowHover: string;
}

export interface UseThemeReturn {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
  theme: ThemePalette;
}

// Static class tokens supporting Tailwind dark mode - prevents SSR hydration mismatches
const STATIC_THEME_PALETTE: ThemePalette = {
  bgApp:       'bg-[#F8FAFC] dark:bg-[#121214]',
  bgPanel:     'bg-white dark:bg-[#18181C]',
  bgSubtle:    'bg-[#F1F5F9] dark:bg-[#202026]',
  border:      'border-slate-200 dark:border-[#333338]',
  divide:      'divide-slate-200 dark:divide-[#333338]',
  textMain:    'text-[#1E293B] dark:text-[#F3F4F6]',
  textMuted:   'text-[#475569] dark:text-[#9CA3AF]',
  textSubtle:  'text-[#64748B] dark:text-[#6B7280]',
  inputBg:     'bg-white dark:bg-[#202026]',
  inputBorder: 'border-[#CBD5E1] dark:border-[#383842]',
  hoverBg:     'hover:bg-[#F1F5F9] dark:hover:bg-[#25252D]',
  rowHover:    'hover:bg-[#F0F8FE] dark:hover:bg-[#202028]',
};

export function useTheme(): UseThemeReturn {
  // Synchronously initialize dark mode from the class applied by head script
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('tf_theme_mode');
        if (stored === 'dark') return 'dark';
        if (stored === 'light') return 'light';
      } catch {}
    }
    return 'light';
  });

  // Sync state on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mode: ThemeMode = 'light';
    try {
      const stored = localStorage.getItem('tf_theme_mode');
      if (stored === 'dark' || stored === 'light') {
        mode = stored;
      }
    } catch {}

    setThemeModeState(mode);
    const dark = mode === 'dark';
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    const dark = mode === 'dark';
    try {
      localStorage.setItem('tf_theme_mode', mode);
      document.cookie = `tf_theme_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.removeItem('tf_theme');
    } catch {}

    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setThemeMode]);

  return { isDarkMode, themeMode, setThemeMode, toggleDarkMode, theme: STATIC_THEME_PALETTE };
}
