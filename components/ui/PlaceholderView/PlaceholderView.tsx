'use client';

import { useThemeContext } from '@/context/ThemeContext';

interface PlaceholderViewProps {
  title: string;
  description?: string;
  useLogo?: boolean;
}

export function PlaceholderView({ title, description, useLogo }: PlaceholderViewProps) {
  const { theme } = useThemeContext();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center gap-3 animate-in fade-in duration-200">
      <div className={`w-20 h-20 rounded-2xl ${theme.bgPanel} border ${theme.border} flex items-center justify-center shadow-xs p-3.5`}>
        {useLogo ? (
          <img src="/logo.png" alt="TeraFlow Logo" className="w-12 h-12 object-contain" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            TF
          </div>
        )}
      </div>
      <h1 className={`text-2xl font-bold ${theme.textMain} fira-sans-bold`}>{title}</h1>
      {description && <p className={`text-sm ${theme.textMuted} max-w-sm`}>{description}</p>}
    </div>
  );
}
