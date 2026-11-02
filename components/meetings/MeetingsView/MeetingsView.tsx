'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import { STATUS_OPTIONS } from '@/types/meeting.types';
import { ScheduleMeetingModal } from '../ScheduleMeetingModal/ScheduleMeetingModal';

export function MeetingsView() {
  const { isDarkMode, theme } = useThemeContext();
  const { meetings, onEditMeeting, onDeleteMeeting } = useCRM();

  // Calendar navigation state - static fallback for prerender
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(() => new Date(2026, 10, 1));
  // Default to null so by default no date is selected and all meetings are visible
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [todayDateStr, setTodayDateStr] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Initialize client date inside useEffect for SSR safety
  useEffect(() => {
    const now = new Date();
    setCurrentCalendarDate(now);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setTodayDateStr(todayStr);
    // User requested: by default no date selected, showing all scheduled meetings
    setSelectedDate(null);
  }, []);

  // Set of dates that have meetings (for blue dot indicators)
  const scheduledDatesSet = useMemo(() => {
    const dates = new Set<string>();
    meetings.forEach((m) => {
      if (m.date) dates.add(m.date);
    });
    return dates;
  }, [meetings]);

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

  // Filter meetings: if selectedDate is set, show only for that date; otherwise show all
  const filteredMeetings = useMemo(() => {
    if (!selectedDate) return meetings;
    return meetings.filter((m) => m.date === selectedDate);
  }, [meetings, selectedDate]);

  // Color text only for status (no colored chips/badges)
  const getStatusTextColor = (status: MeetingStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'text-blue-500 dark:text-blue-400 font-semibold';
      case 'Deal Done':
        return 'text-emerald-500 dark:text-emerald-400 font-semibold';
      case 'Deal Denied':
        return 'text-rose-500 dark:text-rose-400 font-semibold';
      case 'Not attended':
        return 'text-amber-500 dark:text-amber-400 font-semibold';
      default:
        return 'text-slate-500 dark:text-zinc-400 font-semibold';
    }
  };

  const handleOpenAdd = () => {
    setEditingMeeting(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setEditingMeeting(m);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete meeting for "${name}"?`)) {
      onDeleteMeeting(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#333338]">
        <div>
          <h1 className={`text-base font-bold tracking-tight ${theme.textMain}`}>
            Meetings
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer"
        >
          <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          Schedule Meeting
        </button>
      </div>

      {/* Grid: Left Calendar & Sync Notification (4 cols on lg), Right Meetings Table (8 cols on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-3">
          {/* Monthly Calendar */}
          <div className={`p-3.5 rounded-xl border ${theme.border} ${theme.bgPanel}`}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${theme.textMain}`}>
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className={`p-1 rounded border ${theme.border} ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextMonth}
                  className={`p-1 rounded border ${theme.border} ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === dateKey;
                const isToday = todayDateStr === dateKey;
                const hasMeeting = scheduledDatesSet.has(dateKey);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      // Toggle date selection
                      setSelectedDate(isSelected ? null : dateKey);
                    }}
                    className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
                      isSelected
                        ? 'bg-primary text-white font-bold'
                        : isToday
                        ? 'border border-primary text-primary font-bold'
                        : `${theme.textMain} hover:bg-slate-100 dark:hover:bg-zinc-800`
                    }`}
                  >
                    <span>{dayNum}</span>
                    {/* Blue dot on dates when meetings are scheduled */}
                    {hasMeeting && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-blue-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date indicator & Show All toggle */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#333338] flex items-center justify-between text-[11px]">
              <span className={theme.textMuted}>
                {selectedDate ? (
                  <>Selected: <strong className={theme.textMain}>{selectedDate}</strong></>
                ) : (
                  'Showing All Dates'
                )}
              </span>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>
          </div>

          {/* Timezone Sync Notification Guide */}
          <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgPanel} space-y-1.5`}>
            <div className="flex items-center gap-1.5">
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

        {/* Right: Meetings Table */}
        <div className={`lg:col-span-8 rounded-xl border ${theme.border} ${theme.bgPanel} overflow-hidden`}>
          {filteredMeetings.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CalendarDaysIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600 stroke-1" />
              <p className={`text-xs font-medium ${theme.textMuted}`}>
                {selectedDate
                  ? `No meetings scheduled for ${selectedDate}`
                  : 'No scheduled meetings found'}
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3 h-3" />
                Schedule for {selectedDate || 'today'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
                    <th className="py-3 px-4 whitespace-nowrap">Company / Client</th>
                    <th className="py-3 px-4 whitespace-nowrap">Contact</th>
                    <th className="py-3 px-4 whitespace-nowrap">Their Time</th>
                    <th className="py-3 px-4 whitespace-nowrap">Our Time (PKT)</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.divide}`}>
                  {filteredMeetings.map((m) => (
                    <tr key={m.id} className={`${theme.rowHover} transition-colors`}>
                      {/* Company / Client in Single Line - NO ICONS */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`font-semibold ${theme.textMain}`}>
                          {m.businessName}
                        </span>
                        {m.clientName && (
                          <span className={`text-[11px] ${theme.textMuted} font-normal`}>
                            {' · '}{m.clientName}
                          </span>
                        )}
                      </td>

                      {/* Contact in Single Line */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                        <span className={`font-mono ${theme.textMain}`}>
                          {m.phone || '—'}
                        </span>
                        {m.email && (
                          <span className={`${theme.textMuted}`}>
                            {' · '}{m.email}
                          </span>
                        )}
                      </td>

                      {/* Their Time (Only their time, plain text) */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-zinc-300">
                        {m.theirTime || '—'}
                      </td>

                      {/* Our Time (PKT) (Plain text) */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-800 dark:text-zinc-100">
                        {m.ourTime || '—'}
                      </td>

                      {/* Status (Color used ONLY for text, NOT for the chip background) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={m.status}
                          onChange={(e) => onEditMeeting(m.id, { status: e.target.value as MeetingStatus })}
                          className={`text-xs py-0.5 px-1 bg-transparent border-none focus:outline-none cursor-pointer ${getStatusTextColor(m.status)}`}
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
                      <td className="py-2.5 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className={`p-1 rounded ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id, m.businessName)}
                            className={`p-1 rounded ${theme.textMuted} hover:text-rose-500 transition-colors cursor-pointer`}
                            title="Delete"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
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
