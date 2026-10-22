import type { ReactNode } from 'react';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Task } from '../../../types/task.types';
import { TaskList } from '../../tasks/TaskList';
import { useThemeContext } from '../../../context/ThemeContext';

interface TaskbarProps {
  activeTasks: Task[];
  completedTasks: Task[];
  onCompleteTask: (task: Task) => void;
  /** Desktop expand/collapse */
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Mobile drawer */
  isMobileOpen: boolean;
  onMobileClose: () => void;
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
  const { theme } = useThemeContext();

  if (isMobile) {
    return (
      <div className={`h-16 px-4 border-b ${theme.border} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-primary" />
          <h3 className={`text-sm font-bold ${theme.textMain} fira-sans-bold`}>Tasks</h3>
          <span className="text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full ml-1">
            {activeCount}
          </span>
        </div>
        <button
          onClick={onMobileClose}
          className={`p-1.5 ${theme.textMuted} hover:${theme.textMain} rounded-md`}
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
          <span className="text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full ml-1">
            {activeCount}
          </span>
        </div>
        <button
          onClick={onCollapse}
          title="Collapse taskbar"
          className={`p-1.5 ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} rounded-lg transition-colors`}
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
        title="Expand taskbar"
        className={`p-1.5 text-primary ${theme.hoverBg} rounded-lg transition-colors`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function MinimizedRail({ activeCount, onExpand, theme }: { activeCount: number; onExpand: () => void; theme: ReturnType<typeof useThemeContext>['theme'] }) {
  return (
    <div className="flex-1 flex flex-col items-center py-4 space-y-4">
      <div
        onClick={onExpand}
        className={`cursor-pointer flex flex-col items-center gap-1 p-2 rounded-lg ${theme.hoverBg} transition-colors`}
        title="Click to expand tasks"
      >
        <CheckCircleIcon className="w-5 h-5 text-primary" />
        <span className="text-[10px] font-bold bg-primary text-white rounded-full px-1.5 py-0.5">
          {activeCount}
        </span>
      </div>
      <div className={`text-[11px] font-semibold ${theme.textSubtle} rotate-90 whitespace-nowrap mt-6`}>
        Tasks
      </div>
    </div>
  );
}

export function Taskbar({
  activeTasks,
  completedTasks,
  onCompleteTask,
  isExpanded,
  onExpandedChange,
  isMobileOpen,
  onMobileClose,
}: TaskbarProps) {
  const { theme } = useThemeContext();
  const activeCount = activeTasks.length;

  const taskListContent: ReactNode = (
    <TaskList
      activeTasks={activeTasks}
      completedTasks={completedTasks}
      onCompleteTask={onCompleteTask}
    />
  );

  return (
    <>
      {/* Desktop Taskbar */}
      <aside
        className={`hidden lg:flex border-l ${theme.border} ${theme.bgPanel} flex-col shrink-0 h-full transition-all duration-200 ${
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
    </>
  );
}
