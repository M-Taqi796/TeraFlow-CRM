'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Task } from '@/types/task.types';
import { CURRENT_USER, TEAM_MEMBERS } from '@/types/task.types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
}

export function TaskModal({ isOpen, onClose, initialTask }: TaskModalProps) {
  const { theme } = useThemeContext();
  const { onAddTask, onEditTask } = useCRM();

  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(CURRENT_USER.name);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setAssignedTo(initialTask.assignedTo || CURRENT_USER.name);
      setDueDate(initialTask.dueDate || new Date().toISOString().slice(0, 10));
      setDueTime(initialTask.dueTime || '17:00');
    } else {
      setTitle('');
      setAssignedTo(CURRENT_USER.name);
      // Default due date: today
      const today = new Date();
      setDueDate(today.toISOString().slice(0, 10));
      setDueTime('17:00');
    }
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Task title is required.');
      return;
    }

    // Format dueAt string e.g. "Nov 02, 2026 · 05:00 PM"
    let formattedDueAt = dueDate;
    try {
      const [hStr, mStr] = dueTime.split(':');
      const hours = parseInt(hStr, 10);
      const minutes = parseInt(mStr, 10);
      const period = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 === 0 ? 12 : hours % 12;
      const h12Str = h12 < 10 ? '0' + h12 : h12;
      const mStrPad = minutes < 10 ? '0' + minutes : minutes;
      formattedDueAt = `${dueDate} · ${h12Str}:${mStrPad} ${period}`;
    } catch {
      formattedDueAt = `${dueDate} ${dueTime}`;
    }

    if (isEditing && initialTask) {
      onEditTask(initialTask.id, {
        title: title.trim(),
        assignedTo,
        dueDate,
        dueTime,
        dueAt: formattedDueAt,
      });
    } else {
      onAddTask({
        title: title.trim(),
        assignedBy: CURRENT_USER.name, // Active user
        assignedTo,
        dueDate,
        dueTime,
        dueAt: formattedDueAt,
        status: 'TODO', // Automatically pending
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-md flex flex-col rounded-xl border ${theme.border} ${theme.bgPanel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${theme.border} flex items-center justify-between shrink-0`}>
          <h2 className={`text-sm font-bold tracking-tight ${theme.textMain}`}>
            {isEditing ? 'Edit Task' : 'Assign New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-md ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="task-modal-form" onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Title */}
          <div className="space-y-1">
            <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Prepare demo slide deck for Apex Solutions"
              className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-slate-400`}
              autoFocus
            />
          </div>

          {/* Assign To (Team member) */}
          <div className="space-y-1">
            <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={`w-full text-xs pl-3 pr-8 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none cursor-pointer`}
            >
              {TEAM_MEMBERS.map((tm) => (
                <option key={tm.id} value={tm.name}>
                  {tm.name} — {tm.role}{tm.isCurrentUser ? ' (Self)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Due Time (Interactive Callender & Time picker) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none cursor-pointer`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Due Time
              </label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none cursor-pointer`}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-4 py-2.5 border-t ${theme.border} flex items-center justify-end gap-2 shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${theme.border} ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-modal-form"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Assign Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
