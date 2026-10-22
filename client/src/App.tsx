import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardRoute } from './routes/DashboardRoute';
import { LoginRoute } from './routes/LoginRoute';
import { LeadsRoute } from './routes/LeadsRoute';
import {
  CallLogRoute,
  TasksRoute,
  MeetingsRoute,
  EmailOutreachRoute,
  ImportsRoute,
  SettingsRoute,
} from './routes/PlaceholderRoutes';
import type { Task } from './types/task.types';
import type { Meeting, MeetingStatus } from './types/meeting.types';
import type { Lead, LeadStage } from './types/lead.types';
import { SEED_MEETINGS } from './data/meetings.data';
import { SEED_TASKS } from './data/tasks.data';
import { SEED_LEADS } from './data/leads.data';

function DashboardApp() {
  const [selectedNav, setSelectedNav] = useState('Dashboard');

  // Global domain state — passed down to routes & AppShell
  const [meetings, setMeetings] = useState<Meeting[]>(SEED_MEETINGS);
  const [tasks, setTasks]       = useState<Task[]>(SEED_TASKS);
  const [leads, setLeads]       = useState<Lead[]>(SEED_LEADS);

  // Derived task lists (used by both AppShell taskbar and DashboardRoute modal)
  const activeTasks    = tasks.filter((t) => t.status === 'TODO');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  // Nav badge counts — computed once here, passed to Sidebar via AppShell
  const navCounts: Record<string, number> = {
    Leads:    leads.length,
    Tasks:    activeTasks.length,
    Meetings: meetings.filter((m) => m.status === 'Scheduled').length,
  };

  const handleMeetingStatusChange = (id: string, status: MeetingStatus) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleCompleteTask = (taskId: string, comment: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED', completionComment: comment, completedAt: 'Just now' }
          : t
      )
    );
  };

  const handleLeadStageChange = (id: string, stage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage } : l))
    );
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
  };

  const handleCreateLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleLogout = () => {
    alert('Logged out successfully.');
  };

  const renderRoute = () => {
    switch (selectedNav) {
      case 'Dashboard':
        return (
          <DashboardRoute
            meetings={meetings}
            onStatusChange={handleMeetingStatusChange}
            onCompleteTask={handleCompleteTask}
          />
        );
      case 'Leads':
        return (
          <LeadsRoute
            leads={leads}
            onStageChange={handleLeadStageChange}
            onUpdateLead={handleUpdateLead}
            onCreateLead={handleCreateLead}
          />
        );
      case 'Call Log':      return <CallLogRoute />;
      case 'Tasks':         return <TasksRoute />;
      case 'Meetings':      return <MeetingsRoute />;
      case 'Email Outreach':return <EmailOutreachRoute />;
      case 'Imports':       return <ImportsRoute />;
      case 'Settings':      return <SettingsRoute />;
      default:              return <DashboardRoute meetings={meetings} onStatusChange={handleMeetingStatusChange} onCompleteTask={handleCompleteTask} />;
    }
  };

  return (
    <AppShell
      selectedNav={selectedNav}
      onNavChange={setSelectedNav}
      activeTasks={activeTasks}
      completedTasks={completedTasks}
      onCompleteTask={(task: Task) => {
        // Open modal is handled inside DashboardRoute — this wires the taskbar's
        // TaskCard "Complete" button directly to task completion without a modal.
        handleCompleteTask(task.id, 'Done');
      }}
      navCounts={navCounts}
      onLogout={handleLogout}
    >
      {renderRoute()}
    </AppShell>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Home redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login page (no AppShell wrapper) */}
          <Route path="/login" element={<LoginRoute />} />

          {/* Dashboard (full AppShell) */}
          <Route path="/dashboard" element={<DashboardApp />} />

          {/* Catch-all → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
