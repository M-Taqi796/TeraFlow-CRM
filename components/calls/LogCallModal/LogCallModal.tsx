'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { CALL_STATUS_OPTIONS, type CallStatusOption } from '@/types/person.types';

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

export function LogCallModal({ isOpen, onClose, initialLog }: LogCallModalProps) {
  const { theme } = useThemeContext();
  const { people, onAddCallLog, onEditCallLog } = useCRM();

  const isEditing = Boolean(initialLog);

  // Form State
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatusOption>('Answered');
  const [comment, setComment] = useState('');
  const [dateTime, setDateTime] = useState('');

  // Sync state on open/edit
  useEffect(() => {
    if (initialLog) {
      setSelectedPersonId(initialLog.personId || '');
      setBusinessName(initialLog.businessName || '');
      setContactName(initialLog.contactName || '');
      setPhone(initialLog.phone || '');
      setCallStatus((initialLog.callStatus as CallStatusOption) || 'Answered');
      setComment(initialLog.comment || '');
      if (initialLog.timestamp) {
        try {
          const d = new Date(initialLog.timestamp);
          setDateTime(d.toISOString().slice(0, 16));
        } catch {
          setDateTime('');
        }
      }
    } else {
      setSelectedPersonId('');
      setBusinessName('');
      setContactName('');
      setPhone('');
      setCallStatus('Answered');
      setComment('');
      setDateTime(new Date().toISOString().slice(0, 16));
    }
  }, [initialLog, isOpen]);

  // When selecting an existing contact from dropdown
  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);
    if (!personId) {
      setBusinessName('');
      setContactName('');
      setPhone('');
      return;
    }
    const found = people.find((p) => p.id === personId);
    if (found) {
      setBusinessName(found.businessName);
      setContactName(found.contactName || '');
      setPhone(found.phones[0] || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Business Name is required.');
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
        <form id="call-log-form" onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          {/* Select Existing Contact or Type */}
          {!isEditing && (
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold ${theme.textMuted} block`}>
                Select Contact (Optional)
              </label>
              <select
                value={selectedPersonId}
                onChange={(e) => handleSelectPerson(e.target.value)}
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
              >
                <option value="">-- Choose Existing Contact or enter new below --</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.businessName} {p.contactName ? `(${p.contactName})` : ''} — {p.phones[0] || 'No phone'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Business Name */}
          <div className="space-y-1">
            <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
              Company / Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Skyline Dental, Apex Roofing"
              className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} font-semibold focus:outline-none focus:border-primary`}
            />
          </div>

          {/* Person Name & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Person Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Dr. Arthur Bell"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 019-2834"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>
          </div>

          {/* Call Status & Date/Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                Call Status
              </label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value as CallStatusOption)}
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
              >
                {CALL_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Date & Time
              </label>
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
