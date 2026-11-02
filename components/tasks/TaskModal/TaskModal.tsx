'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Task } from '@/types/task.types';

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
  const [assignedBy, setAssignedBy] = useState('Muhammad Taqi');
  const [dueAt, setDueAt] = useState('Today, 05:00 PM');
  const [status, setStatus] = useState<'TODO' | 'COMPLETED'>('TODO');
  const [completionComment, setCompletionComment] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setAssignedBy(initialTask.assignedBy || 'Muhammad Taqi');
      setDueAt(initialTask.dueAt || 'Today');
      setStatus(initialTask.status || 'TODO');
      setCompletionComment(initialTask.completionComment || '');
    } else {
      setTitle('');
      setAssignedBy('Muhammad Taqi');
      setDueAt('Today, 05:00 PM');
      setStatus('TODO');
      setCompletionComment('');
    }
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Task title is required.');
      return;
    }

    if (isEditing && initialTask) {
      onEditTask(initialTask.id, {
        title: title.trim(),
        assignedBy: assignedBy.trim(),
        dueAt: dueAt.trim(),
        status,
        completionComment: status === 'COMPLETED' ? completionComment.trim() : undefined,
        completedAt: status === 'COMPLETED' ? (initialTask.completedAt || 'Just now') : undefined,
      });
    } else {
      onAddTask({
        title: title.trim(),
        assignedBy: assignedBy.trim(),
        dueAt: dueAt.trim(),
        status,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg flex flex-col rounded-2xl border ${theme.border} ${theme.bgPanel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-3.5 border-b ${theme.border} flex items-center justify-between shrink-0`}>
          <h2 className={`text-base font-bold tracking-tight ${theme.textMain}`}>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="task-modal-form" onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          {/* Title */}
          <div className="space-y-1">
            <label className={`text-xs font-semibold ${theme.textMain} block`}>
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call back Dr. Arthur regarding pricing sheet"
              className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} font-semibold focus:outline-none focus:border-primary`}
            />
          </div>

          {/* Assigned By & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-xs font-medium ${theme.textMuted} block`}>
                Assigned By / Owner
              </label>
              <input
                type="text"
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                placeholder="e.g. Muhammad Taqi"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-medium ${theme.textMuted} block`}>
                Due Date / Time
              </label>
              <input
                type="text"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                placeholder="e.g. Today, 05:00 PM / Tomorrow"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className={`text-xs font-medium ${theme.textMuted} block`}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'TODO' | 'COMPLETED')}
              className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
            >
              <option value="TODO">Pending / To Do</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Completion Notes */}
          {status === 'COMPLETED' && (
            <div className="space-y-1 animate-in fade-in">
              <label className={`text-xs font-medium ${theme.textMuted} block`}>
                Completion Comment / Outcome
              </label>
              <textarea
                rows={2}
                value={completionComment}
                onChange={(e) => setCompletionComment(e.target.value)}
                placeholder="Summary of completed outcome or follow-up note..."
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className={`px-5 py-3 border-t ${theme.border} flex items-center justify-end gap-2 shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border ${theme.border} ${theme.bgPanel} ${theme.textMain} ${theme.hoverBg} cursor-pointer`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-modal-form"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs"
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
