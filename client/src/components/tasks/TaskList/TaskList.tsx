import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import type { Task } from '../../../types/task.types';
import { TaskCard } from '../TaskCard';
import { useThemeContext } from '../../../context/ThemeContext';

interface TaskListProps {
  activeTasks: Task[];
  completedTasks: Task[];
  onCompleteTask: (task: Task) => void;
}

export function TaskList({
  activeTasks,
  completedTasks,
  onCompleteTask,
}: TaskListProps) {
  const { isDarkMode, theme } = useThemeContext();

  return (
    <div className="space-y-3">
      {/* Active Tasks */}
      {activeTasks.length === 0 ? (
        <div className={`text-center py-10 ${theme.textSubtle} text-xs`}>
          No pending tasks
        </div>
      ) : (
        activeTasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onCompleteTask} />
        ))
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className={`pt-3 border-t ${theme.border} space-y-2`}>
          <p className={`text-[11px] font-bold ${theme.textSubtle} uppercase tracking-wider`}>
            Completed ({completedTasks.length})
          </p>

          {completedTasks.map((t) => (
            <div
              key={t.id}
              className={`p-2.5 rounded-lg ${
                isDarkMode
                  ? 'bg-emerald-950/30 border-emerald-900/40'
                  : 'bg-emerald-50/40 border-emerald-100'
              } border text-xs space-y-1`}
            >
              <div className="flex items-center gap-1.5">
                <CheckBadgeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className={`line-through ${theme.textSubtle} truncate font-medium`}>
                  {t.title}
                </span>
              </div>

              {t.completionComment && (
                <div
                  className={`ml-5 text-[11px] ${
                    isDarkMode
                      ? 'text-emerald-300 bg-[#1A1A22] border-emerald-800/40'
                      : 'text-emerald-800 bg-white border-emerald-200/50'
                  } p-1.5 rounded border`}
                >
                  {t.completionComment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
