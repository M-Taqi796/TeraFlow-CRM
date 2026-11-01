'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useTheme, type UseThemeReturn } from '@/hooks/useTheme';

const ThemeContext = createContext<UseThemeReturn | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useTheme();
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): UseThemeReturn {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a <ThemeProvider>');
  }
  return ctx;
}
