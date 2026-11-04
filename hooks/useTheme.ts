'use client';

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

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
        const stored = localStorage.getItem('tf_theme_mode') as ThemeMode | null;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          return stored;
        }
      } catch {}
    }
    return 'system';
  });

  // Query OS preference safely
  const getSystemPrefersDark = useCallback((): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Sync state on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mode: ThemeMode = 'system';
    try {
      const stored = localStorage.getItem('tf_theme_mode') as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        mode = stored;
      }
    } catch {}

    setThemeModeState(mode);

    let dark = false;
    if (mode === 'dark') {
      dark = true;
    } else if (mode === 'light') {
      dark = false;
    } else {
      dark = getSystemPrefersDark();
    }

    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [getSystemPrefersDark]);

  // Listen to OS system color-scheme changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        const dark = e.matches;
        setIsDarkMode(dark);
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('tf_theme_mode', mode);
      document.cookie = `tf_theme_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
      // Clean up legacy key if exists
      localStorage.removeItem('tf_theme');
    } catch {}

    let dark = false;
    if (mode === 'dark') {
      dark = true;
    } else if (mode === 'light') {
      dark = false;
    } else {
      // System mode
      dark = getSystemPrefersDark();
    }

    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [getSystemPrefersDark]);

  const toggleDarkMode = useCallback(() => {
    if (isDarkMode) {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  }, [isDarkMode, setThemeMode]);

  return { isDarkMode, themeMode, setThemeMode, toggleDarkMode, theme: STATIC_THEME_PALETTE };
}
