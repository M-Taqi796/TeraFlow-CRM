'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { EMAIL_TYPE_OPTIONS, type EmailTypeOption } from '@/types/person.types';

export interface EmailLogRecord {
  id: string; // activity id
  personId: string;
  businessName: string;
  contactName: string;
  email: string;
  emailType: 'Sent' | 'Reply';
  subject: string;
  comment: string;
  timestamp: string;
  relativeTime?: string;
  author: string;
}

interface LogEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLog?: EmailLogRecord | null;
}

export function LogEmailModal({ isOpen, onClose, initialLog }: LogEmailModalProps) {
  const { theme } = useThemeContext();
  const { people, onAddEmailLog, onEditEmailLog } = useCRM();

  const isEditing = Boolean(initialLog);

  // Form State
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [emailType, setEmailType] = useState<EmailTypeOption>('Sent');
  const [subject, setSubject] = useState('');
  const [comment, setComment] = useState('');
  const [dateTime, setDateTime] = useState('');

  // Sync state on open/edit
  useEffect(() => {
    if (initialLog) {
      setSelectedPersonId(initialLog.personId || '');
      setBusinessName(initialLog.businessName || '');
      setContactName(initialLog.contactName || '');
      setEmail(initialLog.email || '');
      setEmailType(initialLog.emailType || 'Sent');
      setSubject(initialLog.subject || '');
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
      setEmail('');
      setEmailType('Sent');
      setSubject('');
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
      setEmail('');
      return;
    }
    const found = people.find((p) => p.id === personId);
    if (found) {
      setBusinessName(found.businessName);
      setContactName(found.contactName || '');
      setEmail(found.emails[0] || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Business Name is required.');
      return;
    }
    if (!subject.trim()) {
      alert('Email subject is required.');
      return;
    }

    if (isEditing && initialLog) {
      onEditEmailLog(initialLog.id, {
        emailType,
        subject: subject.trim(),
        comment: comment.trim(),
        email: email.trim(),
        timestamp: dateTime ? new Date(dateTime).toISOString() : undefined,
      });
    } else {
      onAddEmailLog({
        personId: selectedPersonId || undefined,
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        emailType,
        subject: subject.trim(),
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
            {isEditing ? 'Edit Email Log' : 'Log Email Outreach'}
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
        <form id="email-log-form" onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
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
                    {p.businessName} {p.contactName ? `(${p.contactName})` : ''} — {p.emails[0] || 'No email'}
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

          {/* Person Name & Email Grid */}
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arthur@skyline.com"
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
            </div>
          </div>

          {/* Email Type & Date/Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                Email Type
              </label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as EmailTypeOption)}
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
              >
                {EMAIL_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t === 'Sent' ? 'Outbound (Sent)' : 'Inbound (Reply)'}
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

          {/* Subject Line */}
          <div className="space-y-1">
            <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
              Subject Line <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Demo confirmation, Follow-up regarding proposal..."
              className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
            />
          </div>

          {/* Comment / Body */}
          <div className="space-y-1">
            <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
              Email Summary / Comment
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Summary of email content, call-to-action, or client reply..."
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
            form="email-log-form"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs"
          >
            {isEditing ? 'Update Email' : 'Save Email Log'}
          </button>
        </div>
      </div>
    </div>
  );
}
