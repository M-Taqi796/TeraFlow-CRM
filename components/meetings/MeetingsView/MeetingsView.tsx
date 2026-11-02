'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import { STATUS_OPTIONS } from '@/types/meeting.types';
import { ScheduleMeetingModal } from '../ScheduleMeetingModal/ScheduleMeetingModal';

export function MeetingsView() {
  const { isDarkMode, theme } = useThemeContext();
  const { meetings, onEditMeeting, onDeleteMeeting } = useCRM();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calendar navigation state - start with stable static date for prerender
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(() => new Date(2026, 10, 1));
  const [todayInfo, setTodayInfo] = useState<{ day: number; month: number; year: number } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Initialize client-side current date
  useEffect(() => {
    const now = new Date();
    setCurrentCalendarDate(now);
    setTodayInfo({
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
    });
  }, []);

  // Status badge styling helper
  const getStatusBadge = (status: MeetingStatus) => {
    if (isDarkMode) {
      switch (status) {
        case 'Scheduled':    return 'bg-blue-950/70 text-blue-300 border-blue-800/80';
        case 'Deal Done':    return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80';
        case 'Deal Denied':  return 'bg-rose-950/70 text-rose-300 border-rose-800/80';
        case 'Not attended': return 'bg-amber-950/70 text-amber-300 border-amber-800/80';
        default:             return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      }
    }
    switch (status) {
      case 'Scheduled':    return 'bg-blue-50 text-primary border-primary/40';
      case 'Deal Done':    return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Deal Denied':  return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'Not attended': return 'bg-amber-50 text-amber-700 border-amber-300';
      default:             return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Calendar calculations
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // Status filter
      if (selectedStatus !== 'All' && m.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.businessName?.toLowerCase().includes(q);
        const matchesClient = m.clientName?.toLowerCase().includes(q);
        const matchesEmail = m.email?.toLowerCase().includes(q);
        const matchesPhone = m.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesClient && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [meetings, selectedStatus, searchQuery]);

  const handleOpenAdd = () => {
    setEditingMeeting(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setEditingMeeting(m);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete meeting for "${name}"?`)) {
      onDeleteMeeting(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6 text-primary" />
            <h1 className={`text-xl font-bold tracking-tight ${theme.textMain}`}>
              Scheduled Meetings
            </h1>
          </div>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            Built-in calendar, dual timezone conversion (Client Time & Our Time), and meeting manager.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          Schedule Meeting
        </button>
      </div>

      {/* Main Grid: Calendar Widget & Quick Stats on Left, Meetings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Calendar (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xs`}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-bold ${theme.textMain}`}>
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className={`p-1 rounded-md border ${theme.border} ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} cursor-pointer transition-colors`}
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className={`p-1 rounded-md border ${theme.border} ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} cursor-pointer transition-colors`}
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === dateKey;
                const isToday =
                  todayInfo !== null &&
                  todayInfo.day === dayNum &&
                  todayInfo.month === month &&
                  todayInfo.year === year;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      if (selectedDate === dateKey) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(dateKey);
                      }
                    }}
                    className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : isToday
                        ? 'border border-primary text-primary font-bold'
                        : `${theme.textMain} hover:bg-slate-100 dark:hover:bg-zinc-800`
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#333338] flex items-center justify-between text-[11px]">
                <span className={theme.textMuted}>
                  Filtered: <strong className={theme.textMain}>{selectedDate}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Clear Date
                </button>
              </div>
            )}
          </div>

          {/* Timezone Converter Quick Info Card */}
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xs space-y-2`}>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary" />
              <h3 className={`text-xs font-bold ${theme.textMain}`}>
                Timezone Sync Guide
              </h3>
            </div>
            <p className={`text-[11px] ${theme.textMuted} leading-relaxed`}>
              Our agency operates on <strong>PKT (UTC+5)</strong>. When scheduling meetings with international clients in EST, PST, GMT, or GST, choose their city and time in the scheduler to automatically calculate and record your exact local equivalent.
            </p>
          </div>
        </div>

        {/* Right Column: Meetings Table & Filters (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlassIcon className={`w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
              <input
                type="text"
                placeholder="Search business, client, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} placeholder-slate-400 focus:outline-none focus:border-primary`}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['All', ...STATUS_OPTIONS].map((st) => {
                const isActive = selectedStatus === st;
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : `border ${theme.border} ${theme.bgPanel} ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg}`
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meetings Table Card */}
          <div className={`rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xs overflow-hidden`}>
            {filteredMeetings.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <CalendarDaysIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600 stroke-1" />
                <div>
                  <p className={`text-sm font-semibold ${theme.textMain}`}>
                    No scheduled meetings found
                  </p>
                  <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                    {searchQuery || selectedStatus !== 'All'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Schedule your first meeting with auto-calculated client time.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Schedule Meeting
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${theme.border} bg-slate-50/70 dark:bg-zinc-800/40 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider`}>
                      <th className="py-2.5 px-3.5">Company / Client</th>
                      <th className="py-2.5 px-3.5">Contact</th>
                      <th className="py-2.5 px-3.5">Their Time (Client)</th>
                      <th className="py-2.5 px-3.5">Our Time (PKT)</th>
                      <th className="py-2.5 px-3.5">Status</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.divide}`}>
                    {filteredMeetings.map((m) => (
                      <tr key={m.id} className={`${theme.rowHover} transition-colors`}>
                        {/* Company & Client */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-start gap-2">
                            <BuildingOffice2Icon className={`w-4 h-4 mt-0.5 ${theme.textMuted} shrink-0`} />
                            <div>
                              <p className={`font-semibold ${theme.textMain} leading-tight`}>
                                {m.businessName}
                              </p>
                              {m.clientName && (
                                <p className={`text-[11px] ${theme.textMuted} flex items-center gap-1 mt-0.5`}>
                                  <UserIcon className="w-3 h-3" />
                                  {m.clientName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-3.5">
                          <p className={`font-mono text-[11px] ${theme.textMain}`}>
                            {m.phone || '—'}
                          </p>
                          <p className={`text-[11px] ${theme.textMuted}`}>
                            {m.email || '—'}
                          </p>
                        </td>

                        {/* Their Time */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                            {m.theirTime || '—'}
                          </span>
                        </td>

                        {/* Our Time */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            {m.ourTime || '—'}
                          </span>
                        </td>

                        {/* Status Select */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <select
                            value={m.status}
                            onChange={(e) => onEditMeeting(m.id, { status: e.target.value as MeetingStatus })}
                            className={`text-[11px] font-semibold py-1 px-2 rounded-md border cursor-pointer focus:outline-none ${getStatusBadge(m.status)}`}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option
                                key={st}
                                value={st}
                                className={
                                  isDarkMode
                                    ? 'bg-[#18181C] text-[#F3F4F6] font-normal'
                                    : 'bg-white text-[#2C2C2C] font-normal'
                                }
                              >
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(m)}
                              className={`p-1.5 rounded-md ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} transition-colors cursor-pointer`}
                              title="Edit Meeting"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(m.id, m.businessName)}
                              className={`p-1.5 rounded-md ${theme.textMuted} hover:text-rose-500 ${theme.hoverBg} transition-colors cursor-pointer`}
                              title="Delete Meeting"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMeeting(null);
        }}
        initialMeeting={editingMeeting}
      />
    </div>
  );
}
