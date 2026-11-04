'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Task } from '@/types/task.types';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Taskbar } from '../Taskbar';
import { Backdrop } from '../../ui/Backdrop';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { STATIC_NAV_ITEMS } from '@/data/navigation.data';
import { NewPersonModal } from '@/components/people/NewPersonModal/NewPersonModal';

interface AppShellProps {
  children: ReactNode;
  selectedNav?: string;
  onNavChange?: (name: string) => void;
  activeTasks?: Task[];
  completedTasks?: Task[];
  onCompleteTask?: (task: Task) => void;
  unreadNav?: Record<string, boolean>;
  navCounts?: Record<string, number>;
  onLogout?: () => void;
  initialNavExpanded?: boolean;
  initialTaskbarExpanded?: boolean;
}

export function AppShell({
  children,
  selectedNav,
  onNavChange,
  activeTasks: propActiveTasks,
  completedTasks: propCompletedTasks,
  onCompleteTask: propOnCompleteTask,
  unreadNav: propUnreadNav,
  navCounts: propNavCounts,
  onLogout: propOnLogout,
  initialNavExpanded = true,
  initialTaskbarExpanded = true,
}: AppShellProps) {
  const { isDarkMode, theme } = useThemeContext();
  const crm = useCRM();

  const activeTasks    = propActiveTasks    ?? crm.activeTasks;
  const completedTasks = propCompletedTasks ?? crm.completedTasks;
  const unreadNav      = propUnreadNav      ?? crm.unreadNav;
  const navCounts      = propNavCounts      ?? crm.navCounts;
  const onLogout       = propOnLogout       ?? crm.onLogout;
  const pathname       = usePathname();

  // Mark navigation tab as read as soon as the user visits it
  useEffect(() => {
    if (!pathname) return;
    const match = STATIC_NAV_ITEMS.find(
      (item) =>
        pathname === item.href ||
        (item.href !== '/dashboard' && pathname.startsWith(item.href))
    );
    if (match) {
      crm.markNavAsRead(match.name);
    }
  }, [pathname, crm.markNavAsRead]);

  const handleTaskComplete = (task: Task) => {
    if (propOnCompleteTask) {
      propOnCompleteTask(task);
    } else {
      crm.onCompleteTask(task.id, 'Completed');
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  // Initialize from server-passed cookie prop (exact match between SSR and hydration)
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(initialNavExpanded);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [isTaskbarExpanded, setIsTaskbarExpanded] = useState<boolean>(initialTaskbarExpanded);
  const [isMobileTasksOpen, setIsMobileTasksOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Sync client localStorage / cookie if available
    try {
      const storedNav = localStorage.getItem('teraflow_nav_expanded');
      if (storedNav !== null) {
        const val = storedNav === 'true';
        setIsNavExpanded(val);
        document.cookie = `teraflow_nav_expanded=${val}; path=/; max-age=31536000; SameSite=Lax`;
      }
      const storedTaskbar = localStorage.getItem('teraflow_taskbar_expanded');
      if (storedTaskbar !== null) {
        const val = storedTaskbar === 'true';
        setIsTaskbarExpanded(val);
        document.cookie = `teraflow_taskbar_expanded=${val}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {}
  }, []);

  const handleNavExpandedChange = (expanded: boolean) => {
    setIsNavExpanded(expanded);
    try {
      localStorage.setItem('teraflow_nav_expanded', String(expanded));
      document.cookie = `teraflow_nav_expanded=${expanded}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  const handleTaskbarExpandedChange = (expanded: boolean) => {
    setIsTaskbarExpanded(expanded);
    try {
      localStorage.setItem('teraflow_taskbar_expanded', String(expanded));
      document.cookie = `teraflow_taskbar_expanded=${expanded}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  return (
    <div
      className={`h-screen w-screen ${theme.bgApp} flex ${theme.textMain} overflow-hidden antialiased transition-colors duration-150`}
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
        onExpandedChange={handleNavExpandedChange}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
        unreadNav={unreadNav}
        navCounts={navCounts}
        onLogout={onLogout}
        disableTransition={!isMounted}
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
        onExpandedChange={handleTaskbarExpandedChange}
        isMobileOpen={isMobileTasksOpen}
        onMobileClose={() => setIsMobileTasksOpen(false)}
        disableTransition={!isMounted}
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
