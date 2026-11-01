'use client';

import { useState, useRef, useEffect } from 'react';
import { ViewColumnsIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  canToggle: boolean;
}

interface ColumnsCustomizerProps {
  columns: ColumnConfig[];
  onToggleColumn: (columnId: string) => void;
  onResetColumns: () => void;
}

export function ColumnsCustomizer({
  columns,
  onToggleColumn,
  onResetColumns,
}: ColumnsCustomizerProps) {
  const { theme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} hover:border-primary/50 transition-colors cursor-pointer shadow-xs`}
      >
        <ViewColumnsIcon className="w-4 h-4 text-primary" />
        <span>Columns</span>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-56 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
            <span className={`text-xs font-bold ${theme.textMain} uppercase tracking-wider`}>
              Visible Columns
            </span>
            <button
              type="button"
              onClick={onResetColumns}
              className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {columns.map((col) => (
              <label
                key={col.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer ${
                  col.canToggle ? theme.hoverBg : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <span className={theme.textMain}>{col.label}</span>
                <input
                  type="checkbox"
                  checked={col.visible}
                  disabled={!col.canToggle}
                  onChange={() => col.canToggle && onToggleColumn(col.id)}
                  className="rounded text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
