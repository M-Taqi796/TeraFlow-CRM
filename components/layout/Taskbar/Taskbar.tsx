import { useState, type ReactNode } from 'react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { Task } from '@/types/task.types';
import { TaskList } from '../../tasks/TaskList';
import { TaskCompleteModal } from '../../tasks/TaskCompleteModal';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';

interface TaskbarProps {
  activeTasks: Task[];
  completedTasks: Task[];
  onCompleteTask?: (task: Task) => void;
  onUncompleteTask?: (task: Task) => void;
  /** Desktop expand/collapse */
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Mobile drawer */
  isMobileOpen: boolean;
  onMobileClose: () => void;
  disableTransition?: boolean;
}

function TaskbarHeader({
  isExpanded,
  activeCount,
  onExpand,
  onCollapse,
  onMobileClose,
  isMobile,
}: {
  isExpanded: boolean;
  activeCount: number;
  onExpand: () => void;
  onCollapse: () => void;
  onMobileClose?: () => void;
  isMobile: boolean;
}) {
  const { theme, isDarkMode } = useThemeContext();

  if (isMobile) {
    return (
      <div className={`h-16 px-4 border-b ${theme.border} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-primary" />
          <h3 className={`text-sm font-bold ${theme.textMain} fira-sans-bold`}>Tasks</h3>
          {activeCount > 0 && (
            <span className="text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full ml-1 tabular-nums">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onMobileClose}
          className={`p-1.5 ${theme.textMuted} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] rounded-md transition-colors`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <div className={`h-16 px-3 border-b ${theme.border} flex items-center justify-between shrink-0 ${theme.bgPanel}`}>
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-primary" />
          <h3 className={`text-sm font-bold ${theme.textMain} fira-sans-bold`}>Tasks</h3>
          {activeCount > 0 && (
            <span className="text-[11px] bg-primary/10 dark:bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full ml-1 tabular-nums">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onCollapse}
          title="Collapse tasks panel"
          className={`p-1.5 ${theme.textMuted} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] rounded-lg transition-colors`}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`h-16 px-3 border-b ${theme.border} flex items-center justify-center shrink-0 ${theme.bgPanel}`}>
      <button
        onClick={onExpand}
        title="Expand tasks panel"
        className="p-1.5 text-primary hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] rounded-lg transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function MinimizedRail({
  activeCount,
  onExpand,
  theme,
}: {
  activeCount: number;
  onExpand: () => void;
  theme: ReturnType<typeof useThemeContext>['theme'];
}) {
  return (
    <div className="flex-1 flex flex-col items-center pt-4 gap-3">
      <button
        onClick={onExpand}
        title="Expand tasks panel"
        className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] transition-colors group"
      >
        <CheckCircleIcon className="w-5 h-5 text-primary" />
        {activeCount > 0 && (
          <span className="text-[10px] font-bold bg-primary text-white rounded-full px-1.5 py-0.5 tabular-nums">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

function TaskbarEmptyState({ theme }: { theme: ReturnType<typeof useThemeContext>['theme'] }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
        <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
      </div>
      <div>
        <p className={`text-sm font-semibold ${theme.textMain}`}>All caught up!</p>
        <p className={`text-xs ${theme.textMuted} mt-1`}>No pending tasks right now.</p>
      </div>
    </div>
  );
}

export function Taskbar({
  activeTasks,
  completedTasks,
  onCompleteTask,
  onUncompleteTask,
  isExpanded,
  onExpandedChange,
  isMobileOpen,
  onMobileClose,
  disableTransition = false,
}: TaskbarProps) {
  const { theme } = useThemeContext();
  const crm = useCRM();
  const activeCount = activeTasks.length;

  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const handleRequestComplete = (task: Task) => {
    setTaskToComplete(task);
  };

  const handleConfirmComplete = (comment: string) => {
    if (!taskToComplete) return;
    crm.onCompleteTask(taskToComplete.id, comment);
    setTaskToComplete(null);
  };

  const handleUncomplete = (task: Task) => {
    if (onUncompleteTask) {
      onUncompleteTask(task);
    } else {
      crm.onToggleTaskStatus(task.id);
    }
  };

  const taskListContent: ReactNode = (
    activeTasks.length === 0 && completedTasks.length === 0 ? (
      <TaskbarEmptyState theme={theme} />
    ) : (
      <TaskList
        activeTasks={activeTasks}
        completedTasks={completedTasks}
        onCompleteTask={handleRequestComplete}
        onUncompleteTask={handleUncomplete}
      />
    )
  );

  return (
    <>
      {/* Desktop Taskbar */}
      <aside
        suppressHydrationWarning
        className={`hidden lg:flex border-l ${theme.border} ${theme.bgPanel} flex-col shrink-0 h-full ${
          disableTransition ? '' : 'transition-all duration-200'
        } ${
          isExpanded ? 'w-80' : 'w-14'
        }`}
      >
        <TaskbarHeader
          isExpanded={isExpanded}
          activeCount={activeCount}
          onExpand={() => onExpandedChange(true)}
          onCollapse={() => onExpandedChange(false)}
          isMobile={false}
        />
        {isExpanded ? (
          <div className="flex-1 overflow-y-auto p-4">{taskListContent}</div>
        ) : (
          <MinimizedRail
            activeCount={activeCount}
            onExpand={() => onExpandedChange(true)}
            theme={theme}
          />
        )}
      </aside>

      {/* Mobile Tasks Slide-over Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 lg:hidden w-80 ${theme.bgPanel} border-l ${theme.border} flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <TaskbarHeader
          isExpanded
          activeCount={activeCount}
          onExpand={() => {}}
          onCollapse={() => {}}
          onMobileClose={onMobileClose}
          isMobile
        />
        <div className="flex-1 overflow-y-auto p-4">{taskListContent}</div>
      </aside>

      {/* Task Complete Modal */}
      {taskToComplete && (
        <TaskCompleteModal
          task={taskToComplete}
          onConfirm={handleConfirmComplete}
          onClose={() => setTaskToComplete(null)}
        />
      )}
    </>
  );
}
