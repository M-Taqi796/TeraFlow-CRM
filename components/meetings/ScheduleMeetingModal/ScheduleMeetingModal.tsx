'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import { STATUS_OPTIONS } from '@/types/meeting.types';

export interface TimezoneOption {
  city: string;
  label: string;
  utcOffset: number; // in hours from UTC
  abbr: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { city: 'New York',      label: 'New York (EST, UTC-5)',         utcOffset: -5, abbr: 'EST' },
  { city: 'Chicago',       label: 'Chicago / Dallas (CST, UTC-6)', utcOffset: -6, abbr: 'CST' },
  { city: 'Denver',        label: 'Denver / Phoenix (MST, UTC-7)', utcOffset: -7, abbr: 'MST' },
  { city: 'Los Angeles',   label: 'Los Angeles / SF (PST, UTC-8)', utcOffset: -8, abbr: 'PST' },
  { city: 'Toronto',       label: 'Toronto (EST, UTC-5)',          utcOffset: -5, abbr: 'EST' },
  { city: 'London',        label: 'London / Dublin (GMT, UTC+0)',  utcOffset: 0,  abbr: 'GMT' },
  { city: 'Paris',         label: 'Paris / Berlin (CET, UTC+1)',   utcOffset: 1,  abbr: 'CET' },
  { city: 'Dubai',         label: 'Dubai / Abu Dhabi (GST, UTC+4)',utcOffset: 4,  abbr: 'GST' },
  { city: 'Karachi',       label: 'Karachi / Lahore (PKT, UTC+5)', utcOffset: 5,  abbr: 'PKT' },
  { city: 'Islamabad',     label: 'Islamabad (PKT, UTC+5)',        utcOffset: 5,  abbr: 'PKT' },
  { city: 'Riyadh',        label: 'Riyadh (AST, UTC+3)',           utcOffset: 3,  abbr: 'AST' },
  { city: 'Singapore',     label: 'Singapore (SGT, UTC+8)',        utcOffset: 8,  abbr: 'SGT' },
  { city: 'Sydney',        label: 'Sydney (AEST, UTC+10)',         utcOffset: 10, abbr: 'AEST' },
];

// Baseline our timezone (PKT, UTC+5)
const OUR_TIMEZONE = { city: 'Pakistan', utcOffset: 5, abbr: 'PKT' };

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMeeting?: Meeting | null;
}

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  initialMeeting,
}: ScheduleMeetingModalProps) {
  const { theme } = useThemeContext();
  const { people, onAddMeeting, onEditMeeting } = useCRM();

  const isEditing = Boolean(initialMeeting);

  // Form State
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<MeetingStatus>('Scheduled');

  // Timezone & Times State
  const [clientCity, setClientCity] = useState('New York');
  const [selectedTzOffset, setSelectedTzOffset] = useState(-5);
  const [selectedTzAbbr, setSelectedTzAbbr] = useState('EST');

  // Time inputs
  const [meetingDate, setMeetingDate] = useState('');
  const [clientTimeStr, setClientTimeStr] = useState('10:00'); // HH:mm in client's time

  const [ourTimeOutput, setOurTimeOutput] = useState('');
  const [theirTimeOutput, setTheirTimeOutput] = useState('');

  // Pre-fill on edit or open
  useEffect(() => {
    if (initialMeeting) {
      setBusinessName(initialMeeting.businessName);
      setClientName(initialMeeting.clientName);
      setPhone(initialMeeting.phone);
      setEmail(initialMeeting.email);
      setStatus(initialMeeting.status);
      setOurTimeOutput(initialMeeting.ourTime);
      setTheirTimeOutput(initialMeeting.theirTime);
    } else {
      setSelectedPersonId('');
      setBusinessName('');
      setClientName('');
      setPhone('');
      setEmail('');
      setStatus('Scheduled');

      // Default meeting date: tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      setMeetingDate(dateStr);
      setClientTimeStr('10:00');
    }
  }, [initialMeeting, isOpen]);

  // Handle existing contact selection
  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);
    if (!personId) {
      setBusinessName('');
      setClientName('');
      setPhone('');
      setEmail('');
      return;
    }
    const found = people.find((p) => p.id === personId);
    if (found) {
      setBusinessName(found.businessName);
      setClientName(found.contactName || '');
      setPhone(found.phones[0] || '');
      setEmail(found.emails[0] || '');
    }
  };

  // Convert client time to our time automatically
  const updateTimes = (
    dateStr: string,
    timeStr: string,
    tzOffset: number,
    tzAbbr: string
  ) => {
    if (!dateStr || !timeStr) return;

    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      // Calculate time difference between Our Time (UTC+5) and Client Time (tzOffset)
      const diffHours = OUR_TIMEZONE.utcOffset - tzOffset;

      // 12-hour format helper
      const format12Hour = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = m.toString().padStart(2, '0');
        const displayHPad = displayH.toString().padStart(2, '0');
        return `${displayHPad}:${displayM} ${period}`;
      };

      // Client time display
      const client12 = format12Hour(hours, minutes);
      setTheirTimeOutput(`${client12} ${tzAbbr}`);

      // Our time calculation:
      // (hours + diffHours) could roll over to next/previous day
      let ourH = (hours + diffHours) % 24;
      if (ourH < 0) ourH += 24;
      const our12 = format12Hour(ourH, minutes);
      setOurTimeOutput(`${our12} ${OUR_TIMEZONE.abbr}`);
    } catch {
      // Fallback
    }
  };

  // Trigger auto-conversion when client time or timezone changes
  useEffect(() => {
    if (!isEditing || !initialMeeting) {
      updateTimes(meetingDate, clientTimeStr, selectedTzOffset, selectedTzAbbr);
    }
  }, [meetingDate, clientTimeStr, selectedTzOffset, selectedTzAbbr]);

  const handleTimezoneChange = (city: string) => {
    setClientCity(city);
    const found = COMMON_TIMEZONES.find((t) => t.city === city);
    if (found) {
      setSelectedTzOffset(found.utcOffset);
      setSelectedTzAbbr(found.abbr);
      updateTimes(meetingDate, clientTimeStr, found.utcOffset, found.abbr);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Business Name is required.');
      return;
    }

    if (isEditing && initialMeeting) {
      onEditMeeting(initialMeeting.id, {
        businessName: businessName.trim(),
        clientName: clientName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        ourTime: ourTimeOutput.trim() || initialMeeting.ourTime,
        theirTime: theirTimeOutput.trim() || initialMeeting.theirTime,
        status,
      });
    } else {
      onAddMeeting({
        businessName: businessName.trim(),
        clientName: clientName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        ourTime: ourTimeOutput.trim() || '03:00 PM PKT',
        theirTime: theirTimeOutput.trim() || '10:00 AM EST',
        status,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg flex flex-col rounded-2xl border ${theme.border} ${theme.bgPanel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-3.5 border-b ${theme.border} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary" />
            <h2 className={`text-base font-bold tracking-tight ${theme.textMain}`}>
              {isEditing ? 'Edit Meeting' : 'Schedule New Meeting'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="meeting-modal-form" onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          {/* Select Existing Contact or Type */}
          {!isEditing && (
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold ${theme.textMuted} block`}>
                Select Contact from CRM (Optional)
              </label>
              <select
                value={selectedPersonId}
                onChange={(e) => handleSelectPerson(e.target.value)}
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
              >
                <option value="">-- Choose Existing Contact or enter new below --</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.businessName} {p.contactName ? `(${p.contactName})` : ''} — {p.city || 'USA'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Business & Client Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                Company / Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Solutions Ltd"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} font-semibold focus:outline-none focus:border-primary`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Kamran Siddiqui"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 415 555 0192"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. client@company.com"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>
          </div>

          {/* Timezone Converter Section */}
          <div className={`p-3.5 rounded-xl border ${theme.border} bg-slate-50/60 dark:bg-zinc-800/40 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${theme.textMain}`}>
                Client Timezone & Automatic Time Equivalent
              </span>
              <span className="text-[10px] font-medium text-primary">
                Our Base: PKT (UTC+5)
              </span>
            </div>

            {/* Client City & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                  Client City / Timezone
                </label>
                <select
                  value={clientCity}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.city} value={tz.city}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                  Client Selected Time
                </label>
                <input
                  type="time"
                  value={clientTimeStr}
                  onChange={(e) => setClientTimeStr(e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                />
              </div>
            </div>

            {/* Calculated Results (Their Time & Our Time) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className={`text-[11px] font-semibold text-amber-600 dark:text-amber-400 block`}>
                  Their Time (Client)
                </label>
                <input
                  type="text"
                  value={theirTimeOutput}
                  onChange={(e) => setTheirTimeOutput(e.target.value)}
                  placeholder="e.g. 10:00 AM EST"
                  className={`w-full text-xs p-2 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 font-bold ${theme.textMain} focus:outline-none`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-semibold text-primary block`}>
                  Our Time (Equivalent)
                </label>
                <input
                  type="text"
                  value={ourTimeOutput}
                  onChange={(e) => setOurTimeOutput(e.target.value)}
                  placeholder="e.g. 08:00 PM PKT"
                  className={`w-full text-xs p-2 rounded-lg border border-primary/40 bg-primary/5 font-bold text-primary focus:outline-none`}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
              Meeting Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MeetingStatus)}
              className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-5 py-3 border-t ${theme.border} flex items-center justify-end gap-2 shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border ${theme.border} ${theme.bgPanel} ${theme.textMain} ${theme.hoverBg} cursor-pointer`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="meeting-modal-form"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs"
          >
            {isEditing ? 'Save Changes' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
}
