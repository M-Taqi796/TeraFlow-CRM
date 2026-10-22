import { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  BuildingOffice2Icon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  PencilSquareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { Lead, LeadStage, LeadPriority, LeadSource } from '../../../types/lead.types';
import { LEAD_STAGES, LEAD_PRIORITIES, LEAD_SOURCES } from '../../../types/lead.types';
import { useThemeContext } from '../../../context/ThemeContext';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (updated: Lead) => void;
}

const STAGE_COLORS: Record<LeadStage, { light: string; dark: string }> = {
  'New':            { light: 'bg-gray-100 text-gray-700 border-gray-300',             dark: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  'Contacted':      { light: 'bg-blue-50 text-primary border-primary/25',             dark: 'bg-blue-950/70 text-blue-300 border-blue-800' },
  'Qualified':      { light: 'bg-violet-50 text-violet-700 border-violet-200',        dark: 'bg-violet-950/70 text-violet-300 border-violet-800' },
  'Proposal Sent':  { light: 'bg-amber-50 text-amber-700 border-amber-200',           dark: 'bg-amber-950/70 text-amber-300 border-amber-800' },
  'Negotiation':    { light: 'bg-orange-50 text-orange-700 border-orange-200',        dark: 'bg-orange-950/70 text-orange-300 border-orange-800' },
  'Won':            { light: 'bg-emerald-50 text-emerald-700 border-emerald-200',     dark: 'bg-emerald-950/70 text-emerald-300 border-emerald-800' },
  'Lost':           { light: 'bg-rose-50 text-rose-700 border-rose-200',              dark: 'bg-rose-950/70 text-rose-300 border-rose-800' },
};

const PRIORITY_COLORS: Record<LeadPriority, { light: string; dark: string; dot: string }> = {
  'Low':    { light: 'text-gray-500',   dark: 'text-zinc-400',   dot: 'bg-gray-400' },
  'Medium': { light: 'text-amber-600',  dark: 'text-amber-400',  dot: 'bg-amber-500' },
  'High':   { light: 'text-rose-600',   dark: 'text-rose-400',   dot: 'bg-rose-500' },
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  const { theme } = useThemeContext();
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${theme.bgSubtle}`}>
        <Icon className={`w-4 h-4 ${theme.textMuted}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] uppercase tracking-wider font-semibold ${theme.textSubtle} fira-sans-semibold`}>
          {label}
        </p>
        <p className={`text-sm font-medium ${theme.textMain} break-all`}>{value}</p>
      </div>
    </div>
  );
}

export function LeadDetailModal({ lead, onClose, onSave }: LeadDetailModalProps) {
  const { isDarkMode, theme } = useThemeContext();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]         = useState<Lead>(lead);
  const [visible, setVisible]     = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const stageColors = STAGE_COLORS[draft.stage];
  const prioColors  = PRIORITY_COLORS[draft.priority];

  const inputClass = `
    w-full text-sm px-3 py-1.5 rounded-lg border
    ${theme.inputBg} ${theme.inputBorder} ${theme.textMain}
    focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary
    transition-colors font-medium
  `;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 z-40 transition-opacity duration-280
          ${isDarkMode ? 'bg-black/60' : 'bg-black/30'}
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-label={`Lead detail: ${lead.businessName}`}
        className={`
          fixed right-0 top-0 bottom-0 z-50 w-full max-w-md
          flex flex-col shadow-2xl
          ${theme.bgPanel}
          transition-transform duration-280 ease-out
          ${visible ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* ── Header ── */}
        <div className={`flex items-start justify-between p-5 border-b ${theme.border} shrink-0`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-blue-950/50' : 'bg-blue-50'}`}>
              <BuildingOffice2Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base font-bold ${theme.textMain} fira-sans-bold truncate`}>
                {draft.businessName}
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>{draft.contactName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {isEditing ? (
              <button
                id="lead-detail-save-btn"
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                Save
              </button>
            ) : (
              <button
                id="lead-detail-edit-btn"
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${theme.border} ${theme.textMuted} hover:border-primary hover:text-primary transition-colors`}
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            <button
              id="lead-detail-close-btn"
              onClick={handleClose}
              aria-label="Close lead detail"
              className={`p-1.5 rounded-lg ${theme.textSubtle} hover:${theme.textMain} ${theme.hoverBg} transition-colors`}
            >
              <XMarkIcon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Stage + Priority badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {isEditing ? (
              <select
                value={draft.stage}
                onChange={(e) => setDraft({ ...draft, stage: e.target.value as LeadStage })}
                aria-label="Lead stage"
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${isDarkMode ? stageColors.dark : stageColors.light}`}
              >
                {LEAD_STAGES.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6] font-normal' : 'bg-white text-[#2C2C2C] font-normal'}
                  >
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${isDarkMode ? stageColors.dark : stageColors.light}`}>
                {draft.stage}
              </span>
            )}

            {isEditing ? (
              <select
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value as LeadPriority })}
                aria-label="Lead priority"
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${theme.inputBg} ${theme.inputBorder} ${theme.textMain}`}
              >
                {LEAD_PRIORITIES.map((p) => (
                  <option key={p} value={p} className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6] font-normal' : 'bg-white text-[#2C2C2C] font-normal'}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? prioColors.dark : prioColors.light}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${prioColors.dot}`} />
                {draft.priority} Priority
              </span>
            )}

            <span className={`text-xs px-2.5 py-1 rounded-md border ${theme.bgSubtle} ${theme.border} ${theme.textMuted} font-medium`}>
              {draft.source}
            </span>
          </div>

          {/* Deal Value */}
          <div className={`rounded-xl border ${theme.border} p-4 ${isDarkMode ? 'bg-blue-950/20' : 'bg-blue-50/60'}`}>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${theme.textSubtle} fira-sans-semibold mb-1`}>
              Deal Value
            </p>
            {isEditing ? (
              <input
                type="number"
                value={draft.dealValue}
                onChange={(e) => setDraft({ ...draft, dealValue: Number(e.target.value) })}
                aria-label="Deal value in USD"
                className={inputClass}
              />
            ) : (
              <p className="text-2xl font-bold text-primary fira-sans-bold">
                ${draft.dealValue.toLocaleString()}
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div className={`rounded-xl border ${theme.border} ${theme.bgSubtle} p-4 space-y-4`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} fira-sans-semibold`}>
              Contact Details
            </p>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>Business Name</label>
                  <input className={inputClass} value={draft.businessName} onChange={(e) => setDraft({ ...draft, businessName: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>Contact Name</label>
                  <input className={inputClass} value={draft.contactName} onChange={(e) => setDraft({ ...draft, contactName: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>Phone</label>
                  <input className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>Email</label>
                  <input className={inputClass} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>Location</label>
                  <input className={inputClass} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>Assigned To</label>
                  <input className={inputClass} value={draft.assignedTo} onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textSubtle} mb-1`}>Source</label>
                  <select
                    value={draft.source}
                    onChange={(e) => setDraft({ ...draft, source: e.target.value as LeadSource })}
                    className={inputClass}
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s} className={isDarkMode ? 'bg-[#18181C] text-[#F3F4F6]' : 'bg-white text-[#2C2C2C]'}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <DetailRow icon={PhoneIcon}      label="Phone"       value={draft.phone} />
                <DetailRow icon={EnvelopeIcon}   label="Email"       value={draft.email} />
                <DetailRow icon={MapPinIcon}     label="Location"    value={draft.location} />
                <DetailRow icon={UserIcon}       label="Assigned To" value={draft.assignedTo} />
              </div>
            )}
          </div>

          {/* Timeline */}
          {!isEditing && (
            <div className={`rounded-xl border ${theme.border} ${theme.bgSubtle} p-4 space-y-3.5`}>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} fira-sans-semibold`}>
                Timeline
              </p>
              <DetailRow icon={CalendarDaysIcon} label="Created"        value={draft.createdAt} />
              <DetailRow icon={CalendarDaysIcon} label="Last Contacted" value={draft.lastContacted} />
            </div>
          )}

          {/* Notes */}
          <div className={`rounded-xl border ${theme.border} p-4 space-y-2 ${theme.bgSubtle}`}>
            <div className="flex items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className={`w-4 h-4 ${theme.textSubtle}`} />
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textSubtle} fira-sans-semibold`}>
                Notes
              </p>
            </div>
            {isEditing ? (
              <textarea
                rows={4}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                aria-label="Lead notes"
                className={`${inputClass} resize-none`}
              />
            ) : (
              <p className={`text-sm ${theme.textMuted} leading-relaxed`}>
                {draft.notes || '—'}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
