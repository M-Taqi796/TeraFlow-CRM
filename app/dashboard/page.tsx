'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from './DashboardView';
import { LeadsView } from './LeadsView';
import { PlaceholderView } from './PlaceholderView';
import type { Task } from '@/types/task.types';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import type { Lead, LeadStage } from '@/types/lead.types';
import { SEED_MEETINGS } from '@/data/meetings.data';
import { SEED_TASKS } from '@/data/tasks.data';
import { SEED_LEADS } from '@/data/leads.data';

export default function DashboardPage() {
  const [selectedNav, setSelectedNav] = useState('Dashboard');

  // Global domain state
  const [meetings, setMeetings] = useState<Meeting[]>(SEED_MEETINGS);
  const [tasks, setTasks]       = useState<Task[]>(SEED_TASKS);
  const [leads, setLeads]       = useState<Lead[]>(SEED_LEADS);

  // Derived task lists
  const activeTasks    = tasks.filter((t) => t.status === 'TODO');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  // Nav badge counts
  const navCounts: Record<string, number> = {
    Leads:    leads.length,
    Tasks:    activeTasks.length,
    Meetings: meetings.filter((m) => m.status === 'Scheduled').length,
  };

  const handleMeetingStatusChange = (id: string, status: MeetingStatus) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
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
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleCreateLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleLogout = () => {
    alert('Logged out successfully.');
  };

  const renderView = () => {
    switch (selectedNav) {
      case 'Dashboard':
        return (
          <DashboardView
            meetings={meetings}
            onStatusChange={handleMeetingStatusChange}
            onCompleteTask={handleCompleteTask}
          />
        );
      case 'Leads':
        return (
          <LeadsView
            leads={leads}
            onStageChange={handleLeadStageChange}
            onUpdateLead={handleUpdateLead}
            onCreateLead={handleCreateLead}
          />
        );
      case 'Call Log':       return <PlaceholderView title="Call Log" description="View all call activity and history." />;
      case 'Tasks':          return <PlaceholderView title="Tasks" description="Full task management view coming soon." />;
      case 'Meetings':       return <PlaceholderView title="Meetings" description="View all scheduled and past meetings." />;
      case 'Email Outreach': return <PlaceholderView title="Email Outreach" description="Manage your email campaigns and sequences." />;
      case 'Imports':        return <PlaceholderView title="Imports" description="Upload and manage lead import batches." />;
      case 'Settings':       return <PlaceholderView title="Settings" description="Configure your CRM preferences." />;
      default:
        return (
          <DashboardView
            meetings={meetings}
            onStatusChange={handleMeetingStatusChange}
            onCompleteTask={handleCompleteTask}
          />
        );
    }
  };

  return (
    <AppShell
      selectedNav={selectedNav}
      onNavChange={setSelectedNav}
      activeTasks={activeTasks}
      completedTasks={completedTasks}
      onCompleteTask={(task: Task) => {
        handleCompleteTask(task.id, 'Done');
      }}
      navCounts={navCounts}
      onLogout={handleLogout}
    >
      {renderView()}
    </AppShell>
  );
}
