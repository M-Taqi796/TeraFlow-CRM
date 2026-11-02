import { CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import type { Task } from '@/types/task.types';
import { CURRENT_USER } from '@/types/task.types';
import { useThemeContext } from '@/context/ThemeContext';

interface TaskCardProps {
  task: Task;
  onComplete: (task: Task) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const { theme } = useThemeContext();

  const isAssignedToMe = !task.assignedTo || task.assignedTo === CURRENT_USER.name;
  const isSelfAssigned = task.assignedBy === CURRENT_USER.name && isAssignedToMe;

  return (
    <div
      className={`p-3.5 rounded-xl border ${theme.border} ${theme.bgSubtle} ${theme.hoverBg} transition-colors space-y-2`}
    >
      <p className={`text-xs font-semibold ${theme.textMain} leading-snug`}>
        {task.title}
      </p>

      <div className={`text-[11px] ${theme.textMuted} space-y-0.5`}>
        <div className="flex items-center justify-between">
          <span className={theme.textSubtle}>Assigned by:</span>
          <span className={`font-medium ${theme.textMain}`}>
            {isSelfAssigned ? 'Self' : task.assignedBy}
          </span>
        </div>

        {!isAssignedToMe && (
          <div className="flex items-center justify-between">
            <span className={theme.textSubtle}>Assigned to:</span>
            <span className="font-semibold text-primary">
              {task.assignedTo}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-0.5">
          <span className={theme.textSubtle}>Due:</span>
          <span className="font-bold text-slate-900 dark:text-zinc-100">
            {task.dueAt}
          </span>
        </div>
      </div>

      {isAssignedToMe ? (
        <button
          onClick={() => onComplete(task)}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 ${theme.bgPanel} border ${theme.border} hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${theme.textMain} hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg text-xs font-semibold transition-all cursor-pointer`}
        >
          <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Complete</span>
        </button>
      ) : (
        <div
          title={`Only ${task.assignedTo} can mark this task complete`}
          className="w-full flex items-center justify-center gap-1.5 py-1 px-3 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-slate-400 dark:text-zinc-500 rounded-lg text-[11px] font-medium cursor-not-allowed"
        >
          <LockClosedIcon className="w-3 h-3 text-slate-400" />
          <span>Assigned to {task.assignedTo}</span>
        </div>
      )}
    </div>
  );
}
