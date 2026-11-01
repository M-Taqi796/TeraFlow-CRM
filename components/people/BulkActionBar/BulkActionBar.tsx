'use client';

import { useState } from 'react';
import {
  TagIcon,
  ArrowsRightLeftIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { PersonStage } from '@/types/person.types';
import { PERSON_STAGES, COMMON_FUB_TAGS } from '@/types/person.types';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkTag: (tag: string) => void;
  onBulkStage: (stage: PersonStage) => void;
  onBulkDelete: () => void;
  onExportSelected: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkTag,
  onBulkStage,
  onBulkDelete,
  onExportSelected,
}: BulkActionBarProps) {
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#1E293B] text-white rounded-2xl shadow-2xl border border-slate-700 px-4 py-2.5 flex items-center gap-3">
        {/* Count badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-600">
          <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold whitespace-nowrap text-slate-200">
            Selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Add Tag Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setTagDropdownOpen((prev) => !prev);
                setStageDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-600"
            >
              <TagIcon className="w-3.5 h-3.5 text-primary" />
              <span>+ Tag</span>
            </button>
            {tagDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-44 bg-[#1E293B] border border-slate-700 rounded-xl shadow-xl p-2 z-50 max-h-48 overflow-y-auto">
                <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                  Apply Tag
                </p>
                {COMMON_FUB_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onBulkTag(tag);
                      setTagDropdownOpen(false);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded text-slate-200 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Change Stage Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStageDropdownOpen((prev) => !prev);
                setTagDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-600"
            >
              <ArrowsRightLeftIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stage</span>
            </button>
            {stageDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-44 bg-[#1E293B] border border-slate-700 rounded-xl shadow-xl p-2 z-50 max-h-48 overflow-y-auto">
                <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                  Set Stage
                </p>
                {PERSON_STAGES.map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => {
                      onBulkStage(stg);
                      setStageDropdownOpen(false);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded text-slate-200 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    {stg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Selected */}
          <button
            type="button"
            onClick={onExportSelected}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-600"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Delete Selected */}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${selectedCount} contacts?`)) {
                onBulkDelete();
              }
            }}
            title="Delete Selected"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/70 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer border border-rose-800"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Clear selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 rounded-full text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer"
          title="Deselect all"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
