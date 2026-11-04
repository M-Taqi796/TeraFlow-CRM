import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { Task } from '@/types/task.types';
import { CURRENT_USER } from '@/types/task.types';
import { TaskCard } from '../TaskCard';
import { useThemeContext } from '@/context/ThemeContext';

interface TaskListProps {
  activeTasks: Task[];
  completedTasks: Task[];
  onCompleteTask: (task: Task) => void;
  onUncompleteTask?: (task: Task) => void;
}

export function TaskList({
  activeTasks,
  completedTasks,
  onCompleteTask,
  onUncompleteTask,
}: TaskListProps) {
  const { isDarkMode, theme } = useThemeContext();

  return (
    <div className="space-y-3">
      {/* Active Tasks */}
      {activeTasks.length === 0 ? (
        <div className={`text-center py-6 ${theme.textSubtle} text-xs`}>
          No pending tasks
        </div>
      ) : (
        activeTasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onCompleteTask} />
        ))
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className={`pt-3 border-t ${theme.border} space-y-2.5`}>
          <p className={`text-[11px] font-bold ${theme.textSubtle} uppercase tracking-wider`}>
            Completed ({completedTasks.length})
          </p>

          {completedTasks.map((t) => {
            const isAssignedToMe = !t.assignedTo || t.assignedTo === CURRENT_USER.name;
            const isSelfAssigned = t.assignedBy === CURRENT_USER.name && isAssignedToMe;

            return (
              <div
                key={t.id}
                className={`p-3 rounded-xl border ${theme.border} ${theme.bgSubtle} space-y-2 transition-colors`}
              >
                {/* Title with completed badge - No line-through */}
                <div className="flex items-start gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-primary dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className={`text-xs font-semibold ${theme.textMain} leading-snug`}>
                    {t.title}
                  </p>
                </div>

                {/* Assignment & Due Info */}
                <div className={`text-[11px] ${theme.textMuted} space-y-1`}>
                  <div className="flex items-center justify-between">
                    <span className={theme.textSubtle}>Assigned by:</span>
                    <span className={`font-medium ${theme.textMain}`}>
                      {isSelfAssigned ? 'Self' : t.assignedBy}
                    </span>
                  </div>

                  {!isAssignedToMe && (
                    <div className="flex items-center justify-between">
                      <span className={theme.textSubtle}>Assigned to:</span>
                      <span className="font-semibold text-primary">
                        {t.assignedTo}
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
                      {t.dueAt || `${t.dueDate || ''} ${t.dueTime || ''}`}
                    </span>
                  </div>
                </div>

                {/* Completion Comment if any */}
                {t.completionComment && (
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 p-2 rounded-lg italic">
                    Note: {t.completionComment}
                  </div>
                )}

                {/* Mark as Pending: Only if task was assigned to me */}
                {isAssignedToMe && onUncompleteTask && (
                  <button
                    type="button"
                    onClick={() => onUncompleteTask(t)}
                    className={`w-full py-1 px-2.5 rounded-lg border ${theme.border} text-[11px] font-medium ${theme.textMuted} hover:text-[#1E293B] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] transition-colors cursor-pointer text-center`}
                  >
                    Mark as Pending
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
