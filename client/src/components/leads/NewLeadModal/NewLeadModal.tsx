import { useState } from 'react';
import {
  XMarkIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import type { Lead, LeadStage, LeadPriority, LeadSource } from '../../../types/lead.types';
import { LEAD_STAGES, LEAD_PRIORITIES, LEAD_SOURCES } from '../../../types/lead.types';
import { useThemeContext } from '../../../context/ThemeContext';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (newLead: Lead) => void;
}

export function NewLeadModal({ isOpen, onClose, onCreateLead }: NewLeadModalProps) {
  const { isDarkMode, theme } = useThemeContext();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName]   = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [location, setLocation]         = useState('');
  const [dealValue, setDealValue]       = useState(10000);
  const [stage, setStage]               = useState<LeadStage>('New');
  const [priority, setPriority]         = useState<LeadPriority>('Medium');
  const [source, setSource]             = useState<LeadSource>('Website');
  const [assignedTo, setAssignedTo]     = useState('Ali Raza');
  const [notes, setNotes]               = useState('');

  const [errors, setErrors]             = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!businessName.trim()) errs.businessName = 'Business name is required';
    if (!contactName.trim())  errs.contactName = 'Contact name is required';
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Valid email is required';
    }
    if (!phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

    const created: Lead = {
      id: `l_${Date.now()}`,
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim() || 'Unspecified',
      dealValue: Number(dealValue) || 0,
      stage,
      priority,
      source,
      assignedTo: assignedTo.trim() || 'Unassigned',
      notes: notes.trim(),
      createdAt: formattedDate,
      lastContacted: 'Just now',
    };

    onCreateLead(created);
    onClose();
  };

  const inputClass = (hasError?: boolean) => `
    w-full text-xs px-3 py-2 rounded-lg border
    ${theme.inputBg} ${hasError ? 'border-rose-500 ring-1 ring-rose-500' : theme.inputBorder} ${theme.textMain}
    focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary
    transition-colors
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className={`${theme.bgPanel} rounded-2xl border ${theme.border} shadow-2xl max-w-lg w-full p-6 relative my-8 animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className={`absolute top-4 right-4 p-1 rounded-lg ${theme.textSubtle} hover:${theme.textMain} ${theme.hoverBg} transition-colors`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-blue-950/50' : 'bg-blue-50'}`}>
            <UserPlusIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${theme.textMain} fira-sans-bold`}>
              Add New Lead
            </h2>
            <p className={`text-xs ${theme.textMuted}`}>
              Enter prospect details to add to your sales pipeline.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Business & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Company / Business *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className={inputClass(!!errors.businessName)}
              />
              {errors.businessName && <p className="text-[10px] text-rose-500 mt-1">{errors.businessName}</p>}
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Contact Person *
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. John Doe"
                className={inputClass(!!errors.contactName)}
              />
              {errors.contactName && <p className="text-[10px] text-rose-500 mt-1">{errors.contactName}</p>}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@acmecorp.com"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 019 2831"
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && <p className="text-[10px] text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 3: Deal Value & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Est. Deal Value ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                className={inputClass()}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Location / Region
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, US"
                className={inputClass()}
              />
            </div>
          </div>

          {/* Row 4: Stage, Priority & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className={inputClass()}
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s} className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className={inputClass()}
              >
                {LEAD_PRIORITIES.map((p) => (
                  <option key={p} value={p} className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className={inputClass()}
              >
                {LEAD_SOURCES.map((src) => (
                  <option key={src} value={src} className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Assigned Rep & Notes */}
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
              Assigned Representative
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Ali Raza"
              className={inputClass()}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>
              Initial Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add preliminary context, budget hints, or requirements..."
              className={`${inputClass()} resize-none`}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border ${theme.border} ${theme.textMuted} hover:${theme.textMain} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
