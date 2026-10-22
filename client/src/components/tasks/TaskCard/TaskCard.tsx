import { CheckIcon } from '@heroicons/react/24/outline';
import type { Task } from '../../../types/task.types';
import { useThemeContext } from '../../../context/ThemeContext';

interface TaskCardProps {
  task: Task;
  onComplete: (task: Task) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const { theme } = useThemeContext();

  return (
    <div
      className={`p-3.5 rounded-xl border ${theme.border} ${theme.bgSubtle} ${theme.hoverBg} transition-colors space-y-2.5`}
    >
      <p className={`text-xs font-semibold ${theme.textMain} leading-snug`}>
        {task.title}
      </p>

      <div className={`text-[11px] ${theme.textMuted} space-y-0.5`}>
        <p className="flex items-center gap-1">
          <span className={theme.textSubtle}>Assigned by:</span>
          <span className={`font-medium ${theme.textMain}`}>{task.assignedBy}</span>
        </p>
        <p className="flex items-center gap-1">
          <span className={theme.textSubtle}>Due:</span>
          <span className={`font-medium ${theme.textMain}`}>{task.dueAt}</span>
        </p>
      </div>

      <button
        onClick={() => onComplete(task)}
        className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 ${theme.bgPanel} border ${theme.border} hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${theme.textMain} hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg text-xs font-semibold transition-all shadow-2xs`}
      >
        <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Complete</span>
      </button>
    </div>
  );
}
