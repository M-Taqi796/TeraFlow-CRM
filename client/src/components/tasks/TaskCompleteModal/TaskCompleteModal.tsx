import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Task } from '../../../types/task.types';
import { useThemeContext } from '../../../context/ThemeContext';

interface TaskCompleteModalProps {
  task: Task;
  onConfirm: (comment: string) => void;
  onClose: () => void;
}

export function TaskCompleteModal({
  task,
  onConfirm,
  onClose,
}: TaskCompleteModalProps) {
  const { isDarkMode, theme } = useThemeContext();
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment.trim() || 'Done');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`${theme.bgPanel} rounded-2xl border ${theme.border} shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div
              className={`w-8 h-8 rounded-full ${
                isDarkMode ? 'bg-emerald-950/70' : 'bg-emerald-100'
              } flex items-center justify-center`}
            >
              <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className={`font-bold text-base ${theme.textMain} fira-sans-bold`}>
              Complete Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`${theme.textMuted} hover:${theme.textMain} p-1 rounded-md`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Task Preview */}
        <div className={`mt-4 ${theme.bgSubtle} p-3 rounded-lg border ${theme.border}`}>
          <p className={`text-xs font-semibold ${theme.textMain}`}>{task.title}</p>
          <p className={`text-[11px] ${theme.textSubtle} mt-1`}>
            Assigned by:{' '}
            <span className={`font-medium ${theme.textMain}`}>{task.assignedBy}</span>
          </p>
        </div>

        {/* Comment Field */}
        <div className="mt-4">
          <label
            htmlFor="task-complete-comment"
            className={`block text-xs font-semibold ${theme.textMain} mb-1.5`}
          >
            Comment:
          </label>
          <textarea
            id="task-complete-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter completion comment..."
            className={`w-full text-xs p-3 border ${theme.inputBorder} rounded-lg ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:${theme.textSubtle}`}
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className={`px-3.5 py-2 text-xs font-medium ${theme.textMuted} hover:${theme.textMain} border ${theme.border} rounded-lg ${theme.hoverBg} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckIcon className="w-4 h-4" />
            Mark as Done
          </button>
        </div>
      </div>
    </div>
  );
}
