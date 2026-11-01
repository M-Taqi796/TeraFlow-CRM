'use client';

import { useThemeContext } from '@/context/ThemeContext';

interface PlaceholderViewProps {
  title: string;
  description: string;
}

export function PlaceholderView({ title, description }: PlaceholderViewProps) {
  const { theme } = useThemeContext();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-3">
      <p className={`text-2xl font-bold ${theme.textMain} fira-sans-bold`}>{title}</p>
      <p className={`text-sm ${theme.textMuted} max-w-xs`}>{description}</p>
    </div>
  );
}
