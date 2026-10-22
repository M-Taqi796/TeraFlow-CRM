import { useState, useMemo } from 'react';
import type { TimePeriod } from '../types/metrics.types';
import type { Meeting, MeetingStatus } from '../types/meeting.types';
import type { Task } from '../types/task.types';
import { METRICS_DATA } from '../data/metrics.data';
import { MetricCard } from '../components/dashboard/MetricCard';
import { DonutChart } from '../components/dashboard/DonutChart';
import { MeetingsTable } from '../components/dashboard/MeetingsTable';
import { TaskCompleteModal } from '../components/tasks/TaskCompleteModal';

interface DashboardRouteProps {
  meetings: Meeting[];
  onStatusChange: (id: string, status: MeetingStatus) => void;
  onCompleteTask: (taskId: string, comment: string) => void;
}

export function DashboardRoute({
  meetings,
  onStatusChange,
  onCompleteTask,
}: DashboardRouteProps) {
  // Metric card period selectors
  const [newLeadsPeriod, setNewLeadsPeriod]             = useState<TimePeriod>('Daily');
  const [callsAttemptedPeriod, setCallsAttemptedPeriod] = useState<TimePeriod>('Daily');
  const [connectedCallsPeriod, setConnectedCallsPeriod] = useState<TimePeriod>('Daily');
  const [chartPeriod, setChartPeriod]                   = useState<TimePeriod>('Daily');

  // Meetings search + filter
  const [meetingSearch, setMeetingSearch]   = useState('');
  const [statusFilter, setStatusFilter]     = useState<'All' | MeetingStatus>('All');

  // Task completion modal
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const q = meetingSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.businessName.toLowerCase().includes(q) ||
        m.clientName.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.ourTime.toLowerCase().includes(q) ||
        m.theirTime.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [meetings, meetingSearch, statusFilter]);

  const handleConfirmComplete = (comment: string) => {
    if (!taskToComplete) return;
    onCompleteTask(taskToComplete.id, comment);
    setTaskToComplete(null);
  };

  return (
    <>
      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <MetricCard
          label="New Leads"
          value={METRICS_DATA[newLeadsPeriod].newLeads.value}
          change={METRICS_DATA[newLeadsPeriod].newLeads.change}
          period={newLeadsPeriod}
          onPeriodChange={setNewLeadsPeriod}
          ariaLabel="New leads time period"
        />
        <MetricCard
          label="Calls Attempted"
          value={METRICS_DATA[callsAttemptedPeriod].callsAttempted.value}
          change={METRICS_DATA[callsAttemptedPeriod].callsAttempted.change}
          period={callsAttemptedPeriod}
          onPeriodChange={setCallsAttemptedPeriod}
          ariaLabel="Calls attempted time period"
        />
        <MetricCard
          label="Connected Calls"
          value={METRICS_DATA[connectedCallsPeriod].connectedCalls.value}
          change={METRICS_DATA[connectedCallsPeriod].connectedCalls.change}
          period={connectedCallsPeriod}
          onPeriodChange={setConnectedCallsPeriod}
          ariaLabel="Connected calls time period"
        />
        <DonutChart period={chartPeriod} onPeriodChange={setChartPeriod} />
      </section>

      {/* Meetings Table */}
      <MeetingsTable
        meetings={filteredMeetings}
        searchValue={meetingSearch}
        onSearchChange={setMeetingSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onStatusChange={onStatusChange}
      />

      {/* Task Completion Modal */}
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
