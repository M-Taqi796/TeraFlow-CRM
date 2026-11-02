'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import type { Task } from '@/types/task.types';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Taskbar } from '../Taskbar';
import { Backdrop } from '../../ui/Backdrop';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { NewPersonModal } from '@/components/people/NewPersonModal/NewPersonModal';

interface AppShellProps {
  children: ReactNode;
  selectedNav?: string;
  onNavChange?: (name: string) => void;
  activeTasks?: Task[];
  completedTasks?: Task[];
  onCompleteTask?: (task: Task) => void;
  navCounts?: Record<string, number>;
  onLogout?: () => void;
}

export function AppShell({
  children,
  selectedNav,
  onNavChange,
  activeTasks: propActiveTasks,
  completedTasks: propCompletedTasks,
  onCompleteTask: propOnCompleteTask,
  navCounts: propNavCounts,
  onLogout: propOnLogout,
}: AppShellProps) {
  const { isDarkMode, theme } = useThemeContext();
  const crm = useCRM();

  const activeTasks    = propActiveTasks    ?? crm.activeTasks;
  const completedTasks = propCompletedTasks ?? crm.completedTasks;
  const navCounts      = propNavCounts      ?? crm.navCounts;
  const onLogout       = propOnLogout       ?? crm.onLogout;
  const handleTaskComplete = (task: Task) => {
    if (propOnCompleteTask) {
      propOnCompleteTask(task);
    } else {
      crm.onCompleteTask(task.id, 'Completed');
    }
  };

  const [isNavExpanded, setIsNavExpanded]         = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen]     = useState(false);
  const [isTaskbarExpanded, setIsTaskbarExpanded] = useState(true);
  const [isMobileTasksOpen, setIsMobileTasksOpen] = useState(false);

  return (
    <div
      className={`h-screen w-screen ${theme.bgApp} flex ${theme.textMain} overflow-hidden antialiased transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Mobile Nav Backdrop */}
      {isMobileNavOpen && (
        <Backdrop onClick={() => setIsMobileNavOpen(false)} className="md:hidden" />
      )}

      {/* Mobile Tasks Backdrop */}
      {isMobileTasksOpen && (
        <Backdrop onClick={() => setIsMobileTasksOpen(false)} className="lg:hidden" />
      )}

      {/* Left Sidebar */}
      <Sidebar
        selectedNav={selectedNav}
        onNavChange={onNavChange}
        isExpanded={isNavExpanded}
        onExpandedChange={setIsNavExpanded}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
        navCounts={navCounts}
        onLogout={onLogout}
      />

      {/* Center Column */}
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden ${theme.bgApp}`}>
        <Header
          activeTaskCount={activeTasks.length}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenMobileTasks={() => setIsMobileTasksOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* Right Taskbar */}
      <Taskbar
        activeTasks={activeTasks}
        completedTasks={completedTasks}
        onCompleteTask={handleTaskComplete}
        onUncompleteTask={(task) => crm.onToggleTaskStatus(task.id)}
        isExpanded={isTaskbarExpanded}
        onExpandedChange={setIsTaskbarExpanded}
        isMobileOpen={isMobileTasksOpen}
        onMobileClose={() => setIsMobileTasksOpen(false)}
      />

      {/* Global New Lead / Add Contact Modal */}
      <NewPersonModal
        isOpen={crm.isNewLeadModalOpen}
        onClose={crm.closeNewLeadModal}
        onCreate={(lead) => crm.onCreatePerson(lead)}
        onBulkCreate={(leads) => crm.onBulkCreatePeople(leads)}
      />
    </div>
  );
}
