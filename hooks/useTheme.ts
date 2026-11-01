'use client';

import { useState, useEffect } from 'react';

export interface ThemePalette {
  bgApp: string;
  bgPanel: string;
  bgSubtle: string;
  border: string;
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
  toggleDarkMode: () => void;
  theme: ThemePalette;
}

export function useTheme(): UseThemeReturn {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize from localStorage on the client only
  useEffect(() => {
    const stored = localStorage.getItem('tf_theme');
    if (stored === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tf_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const theme: ThemePalette = {
    bgApp:       isDarkMode ? 'bg-[#121214]'      : 'bg-[#F8FAFC]',
    bgPanel:     isDarkMode ? 'bg-[#18181C]'      : 'bg-[#FFFFFF]',
    bgSubtle:    isDarkMode ? 'bg-[#202026]'      : 'bg-[#F1F5F9]',
    border:      isDarkMode ? 'border-[#333338]'  : 'border-[#CBD5E1]',
    textMain:    isDarkMode ? 'text-[#F3F4F6]'    : 'text-[#1E293B]',
    textMuted:   isDarkMode ? 'text-[#9CA3AF]'    : 'text-[#475569]',
    textSubtle:  isDarkMode ? 'text-[#6B7280]'    : 'text-[#64748B]',
    inputBg:     isDarkMode ? 'bg-[#202026]'      : 'bg-[#FFFFFF]',
    inputBorder: isDarkMode ? 'border-[#383842]'  : 'border-[#CBD5E1]',
    hoverBg:     isDarkMode ? 'hover:bg-[#25252D]': 'hover:bg-[#F1F5F9]',
    rowHover:    isDarkMode ? 'hover:bg-[#202028]': 'hover:bg-[#F0F8FE]',
  };

  return { isDarkMode, toggleDarkMode, theme };
}
