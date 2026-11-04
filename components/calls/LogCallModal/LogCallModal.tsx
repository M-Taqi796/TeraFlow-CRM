'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { CALL_STATUS_OPTIONS, type CallStatusOption, type Person } from '@/types/person.types';

export interface CallLogRecord {
  id: string; // activity id
  personId: string;
  businessName: string;
  contactName: string;
  phone: string;
  callStatus: string;
  comment: string;
  timestamp: string;
  relativeTime?: string;
  author: string;
}

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLog?: CallLogRecord | null;
}

function getLocalCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function LogCallModal({ isOpen, onClose, initialLog }: LogCallModalProps) {
  const { theme } = useThemeContext();
  const { people, onAddCallLog, onEditCallLog } = useCRM();

  const isEditing = Boolean(initialLog);

  // Search & Contact States
  const [contactSearch, setContactSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatusOption>('Answered');
  const [comment, setComment] = useState('');
  const [dateTime, setDateTime] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state on open/edit
  useEffect(() => {
    if (initialLog) {
      setSelectedPersonId(initialLog.personId || '');
      setBusinessName(initialLog.businessName || '');
      setContactName(initialLog.contactName || '');
      setPhone(initialLog.phone || '');
      setCallStatus((initialLog.callStatus as CallStatusOption) || 'Answered');
      setComment(initialLog.comment || '');
      setContactSearch(initialLog.businessName || '');
      setIsDropdownOpen(false);

      if (initialLog.timestamp) {
        try {
          const d = new Date(initialLog.timestamp);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        } catch {
          setDateTime(getLocalCurrentDateTime());
        }
      } else {
        setDateTime(getLocalCurrentDateTime());
      }
    } else {
      setSelectedPersonId('');
      setBusinessName('');
      setContactName('');
      setPhone('');
      setCallStatus('Answered');
      setComment('');
      setContactSearch('');
      setIsDropdownOpen(false);
      // Automatically fetch current date and time
      setDateTime(getLocalCurrentDateTime());
    }
  }, [initialLog, isOpen]);

  // Matching contacts for search
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim() || selectedPersonId) return [];
    const q = contactSearch.toLowerCase();
    return people
      .filter((p) => {
        const matchesBusiness = p.businessName?.toLowerCase().includes(q);
        const matchesName = p.contactName?.toLowerCase().includes(q);
        const matchesPhone = p.phones?.some((ph) => ph.toLowerCase().includes(q));
        const matchesEmail = p.emails?.some((em) => em.toLowerCase().includes(q));
        return matchesBusiness || matchesName || matchesPhone || matchesEmail;
      })
      .slice(0, 6);
  }, [contactSearch, people, selectedPersonId]);

  const handleSelectContact = (p: Person) => {
    setSelectedPersonId(p.id);
    setBusinessName(p.businessName);
    setContactName(p.contactName || '');
    setPhone(p.phones[0] || '');
    setContactSearch(`${p.businessName}${p.contactName ? ` (${p.contactName})` : ''}`);
    setIsDropdownOpen(false);
  };

  const handleClearContact = () => {
    setSelectedPersonId('');
    setBusinessName('');
    setContactName('');
    setPhone('');
    setContactSearch('');
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Please search and select a contact first.');
      return;
    }

    if (isEditing && initialLog) {
      onEditCallLog(initialLog.id, {
        callStatus,
        comment: comment.trim(),
        phone: phone.trim(),
        timestamp: dateTime ? new Date(dateTime).toISOString() : undefined,
      });
    } else {
      onAddCallLog({
        personId: selectedPersonId || undefined,
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        callStatus,
        comment: comment.trim(),
        timestamp: dateTime ? new Date(dateTime).toISOString() : undefined,
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
          <h2 className={`text-base font-bold tracking-tight ${theme.textMain}`}>
            {isEditing ? 'Edit Call Log' : 'Log Phone Call'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="call-log-form" onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Search Contact with autocomplete suggestions */}
          {!isEditing ? (
            <div className="space-y-1 relative" ref={contactDropdownRef}>
              <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                Search Contact <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contactSearch}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                    setSelectedPersonId('');
                    setIsDropdownOpen(true);
                  }}
                  placeholder="Search business, contact name, or phone..."
                  className={`w-full text-xs p-2 pl-8 pr-7 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                />
                <MagnifyingGlassIcon className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${theme.textSubtle}`} />
                {contactSearch && (
                  <button
                    type="button"
                    onClick={handleClearContact}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {isDropdownOpen && filteredContacts.length > 0 && !selectedPersonId && (
                <div className={`absolute z-30 left-0 right-0 top-full mt-1 rounded-lg border ${theme.border} ${theme.bgPanel} shadow-xl overflow-hidden divide-y ${theme.divide} max-h-56 overflow-y-auto`}>
                  {filteredContacts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectContact(p)}
                      className={`w-full px-3 py-2 text-left text-xs ${theme.hoverBg} flex items-center justify-between cursor-pointer`}
                    >
                      <div>
                        <span className={`font-semibold ${theme.textMain}`}>
                          {p.businessName}
                        </span>
                        {p.contactName && (
                          <span className={`text-[11px] ${theme.textMuted} ml-1.5`}>
                            · {p.contactName}
                          </span>
                        )}
                        <p className={`text-[10px] ${theme.textMuted}`}>
                          {p.phones[0] || p.emails[0] || p.niche || p.city || 'No direct phone'}
                        </p>
                      </div>
                      {(p.city || p.niche) && (
                        <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                          {p.city || p.niche}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Auto-filled details in single clean line if contact selected or editing */}
          {businessName && (
            <div className={`px-3 py-2 rounded-lg border ${theme.border} text-xs ${theme.textMuted} flex items-center justify-between bg-primary/5`}>
              <span className="truncate">
                <strong className={theme.textMain}>{businessName}</strong>
                {contactName && ` · ${contactName}`}
                {phone && ` · ${phone}`}
              </span>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleClearContact}
                  className={`text-[11px] text-slate-400 hover:${theme.textMain} ml-2 underline cursor-pointer shrink-0`}
                >
                  Change
                </button>
              ) : (
                <CheckIcon className="w-4 h-4 text-primary shrink-0 ml-2" />
              )}
            </div>
          )}

          {/* Call Status & Date/Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                Call Status
              </label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value as CallStatusOption)}
                className={`w-full text-xs pl-3 pr-8 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
              >
                {CALL_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                  Date & Time
                </label>
                <span className="text-[10px] text-primary font-medium">Auto-fetched current time</span>
              </div>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>
          </div>

          {/* Comment / Notes */}
          <div className="space-y-1">
            <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
              Call Comment / Notes
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What happened during this call? Follow-up details, objections, agreed next steps..."
              className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary leading-relaxed resize-none`}
            />
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
            form="call-log-form"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs"
          >
            {isEditing ? 'Update Call Log' : 'Save Call Log'}
          </button>
        </div>
      </div>
    </div>
  );
}
