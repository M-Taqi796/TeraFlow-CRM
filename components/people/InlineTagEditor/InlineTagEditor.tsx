'use client';

import { useState, useRef, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { COMMON_TAGS } from '@/types/person.types';

interface InlineTagEditorProps {
  existingTags: string[];
  onAddTag: (tag: string) => void;
}

export function InlineTagEditor({ existingTags, onAddTag }: InlineTagEditorProps) {
  const { theme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectTag = (tag: string) => {
    onAddTag(tag.replace(/^#/, ''));
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTag.trim().replace(/^#/, '');
    if (clean) {
      onAddTag(clean);
      setCustomTag('');
      setIsOpen(false);
    }
  };

  const availableTags = COMMON_TAGS.filter((t: string) => !existingTags.includes(t));

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title="Add tag"
        className={`p-1 rounded-md text-xs font-semibold border ${theme.border} ${theme.bgSubtle} ${theme.textMuted} hover:text-primary hover:border-primary/50 transition-colors inline-flex items-center justify-center cursor-pointer`}
      >
        <PlusIcon className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 mt-1 w-52 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 dark:border-zinc-800">
            <span className={`text-[11px] font-bold ${theme.textMain} uppercase tracking-wider`}>
              Add Tag
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`p-0.5 rounded ${theme.textMuted} hover:${theme.textMain}`}
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleCustomSubmit} className="mb-2">
            <input
              ref={inputRef}
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Create new tag..."
              className={`w-full text-xs px-2 py-1 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
            />
          </form>

          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {availableTags.length === 0 && !customTag ? (
              <p className={`text-[11px] ${theme.textSubtle} py-1 text-center`}>
                All standard tags applied
              </p>
            ) : (
              availableTags.map((tag: string) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectTag(tag)}
                  className={`w-full text-left text-xs px-2 py-1 rounded-md ${theme.hoverBg} ${theme.textMain} flex items-center justify-between transition-colors cursor-pointer`}
                >
                  <span>{tag.replace(/^#/, '')}</span>
                  <PlusIcon className="w-3 h-3 text-primary opacity-60" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
