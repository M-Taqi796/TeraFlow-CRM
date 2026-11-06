'use client';

import { useState, useMemo, useEffect } from 'react';
import type { TimePeriod } from '@/types/metrics.types';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import type { Task } from '@/types/task.types';
import { METRICS_DATA } from '@/data/metrics.data';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { MeetingsTable } from '@/components/dashboard/MeetingsTable';
import { TaskCompleteModal } from '@/components/tasks/TaskCompleteModal';
import { useCRM } from '@/context/CRMContext';

interface DashboardViewProps {
  meetings?: Meeting[];
  onStatusChange?: (id: string, status: MeetingStatus) => void;
  onCompleteTask?: (taskId: string, comment: string) => void;
  initialGreeting?: string;
  initialDateStr?: string;
}

export function DashboardView({
  meetings: propMeetings,
  onStatusChange: propOnStatusChange,
  onCompleteTask: propOnCompleteTask,
  initialGreeting = 'Good morning',
  initialDateStr = '',
}: DashboardViewProps = {}) {
  const crm = useCRM();

  const meetings       = propMeetings       ?? crm.meetings;
  const onStatusChange = propOnStatusChange ?? crm.onMeetingStatusChange;
  const onCompleteTask = propOnCompleteTask ?? crm.onCompleteTask;

  const [newLeadsPeriod, setNewLeadsPeriod]             = useState<TimePeriod>('Daily');
  const [callsAttemptedPeriod, setCallsAttemptedPeriod] = useState<TimePeriod>('Daily');
  const [connectedCallsPeriod, setConnectedCallsPeriod] = useState<TimePeriod>('Daily');
  const [chartPeriod, setChartPeriod]                   = useState<TimePeriod>('Daily');

  const [meetingSearch, setMeetingSearch]   = useState('');
  const [statusFilter, setStatusFilter]     = useState<'All' | MeetingStatus>('All');
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    setTodayStr(
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(now)
    );
    setMounted(true);
  }, []);

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

  // Dynamic metrics computed from live CRM data
  const metrics = useMemo(() => {
    let totalCalls = 0;
    let connectedCalls = 0;

    crm.people.forEach((p) => {
      (p.activities || []).forEach((a) => {
        if (a.type === 'call') {
          totalCalls++;
          if (a.callStatus === 'Answered') {
            connectedCalls++;
          }
        }
      });
    });

    const bookedMeetings = meetings.filter(
      (m) => m.status === 'Deal Done' || m.status === 'Scheduled'
    ).length;

    const connectionRate = totalCalls > 0
      ? `${((connectedCalls / totalCalls) * 100).toFixed(1)}% connection rate`
      : '0.0% connection rate';

    return {
      newLeads: {
        value: String(crm.people.length),
        change: `${crm.people.filter((p) => p.stage === 'New Leads').length} in New Leads`,
      },
      callsAttempted: {
        value: String(totalCalls),
        change: `${totalCalls} calls logged`,
      },
      connectedCalls: {
        value: String(connectedCalls),
        change: connectionRate,
      },
      chart: {
        totalCalls,
        bookedMeetings,
      },
    };
  }, [crm.people, meetings]);

  return (
    <>
      {/* Greeting row */}
      <div className="flex flex-col gap-0.5 min-h-[46px] justify-center">
        {mounted ? (
          <div className="animate-in fade-in duration-150">
            <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] font-medium">
              {todayStr}
            </p>
            <h1 className="text-xl font-bold text-[#1E293B] dark:text-[#F3F4F6] tracking-tight fira-sans-bold">
              {greeting}, Muhammad.
            </h1>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 animate-pulse py-1">
            <div className="h-3 w-36 bg-slate-200 dark:bg-zinc-800 rounded-sm" />
            <div className="h-6 w-56 bg-slate-200 dark:bg-zinc-800 rounded-md" />
          </div>
        )}
      </div>
      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <MetricCard
          label="New Leads"
          value={metrics.newLeads.value}
          change={metrics.newLeads.change}
          period={newLeadsPeriod}
          onPeriodChange={setNewLeadsPeriod}
          ariaLabel="New leads time period"
        />
        <MetricCard
          label="Calls Attempted"
          value={metrics.callsAttempted.value}
          change={metrics.callsAttempted.change}
          period={callsAttemptedPeriod}
          onPeriodChange={setCallsAttemptedPeriod}
          ariaLabel="Calls attempted time period"
        />
        <MetricCard
          label="Connected Calls"
          value={metrics.connectedCalls.value}
          change={metrics.connectedCalls.change}
          period={connectedCallsPeriod}
          onPeriodChange={setConnectedCallsPeriod}
          ariaLabel="Connected calls time period"
        />
        <DonutChart
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
          totalCalls={metrics.chart.totalCalls}
          bookedMeetings={metrics.chart.bookedMeetings}
        />
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
