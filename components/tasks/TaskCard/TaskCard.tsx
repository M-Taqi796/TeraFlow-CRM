import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
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
      className={`p-3.5 rounded-xl border ${theme.border} ${theme.bgSubtle} ${theme.hoverBg} transition-colors space-y-2.5`}
    >
      <p className={`text-xs font-semibold ${theme.textMain} leading-snug`}>
        {task.title}
      </p>

      {/* Assignment Info */}
      <div className={`text-[11px] ${theme.textMuted} space-y-1`}>
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

        {/* Due Date & Time */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-[#333338]">
          <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <ClockIcon className="w-3.5 h-3.5 shrink-0" />
            Due:
          </span>
          <span className={`text-xs ${theme.textMain} font-medium`}>
            {task.dueAt || `${task.dueDate || ''} ${task.dueTime || ''}`}
          </span>
        </div>
      </div>

      {/* Only show Complete button for tasks assigned to the active user. No inactive button for others! */}
      {isAssignedToMe && (
        <button
          onClick={() => onComplete(task)}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 ${theme.bgPanel} border ${theme.border} hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/20 ${theme.textMain} hover:text-primary rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs`}
        >
          <CheckIcon className="w-3.5 h-3.5 text-primary" />
          <span>Complete</span>
        </button>
      )}
    </div>
  );
}
