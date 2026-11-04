import type { Lead, LeadStage, LeadPriority } from '@/types/lead.types';
import { LEAD_STAGES } from '@/types/lead.types';
import { useThemeContext } from '@/context/ThemeContext';

interface LeadRowProps {
  lead: Lead;
  onStageChange: (id: string, stage: LeadStage) => void;
  onRowClick: (lead: Lead) => void;
}

const STAGE_TEXT_COLORS: Record<LeadStage, string> = {
  'New':           'text-slate-500 dark:text-zinc-400 font-semibold',
  'Lead':          'text-slate-500 dark:text-zinc-400 font-semibold',
  'Contacted':     'text-blue-600 dark:text-blue-400 font-semibold',
  'Qualified':     'text-violet-600 dark:text-violet-400 font-semibold',
  'Hot Prospect':  'text-amber-600 dark:text-amber-400 font-semibold',
  'Proposal Sent': 'text-amber-600 dark:text-amber-400 font-semibold',
  'Negotiation':   'text-orange-600 dark:text-orange-400 font-semibold',
  'Won':           'text-emerald-600 dark:text-emerald-400 font-semibold',
  'Lost':          'text-rose-600 dark:text-rose-400 font-semibold',
  'Past Client':   'text-teal-600 dark:text-teal-400 font-semibold',
  'Trash':         'text-rose-600 dark:text-rose-400 font-semibold',
};

const PRIORITY_CONFIG: Record<LeadPriority, { dot: string; label: string; text: string }> = {
  Low:    { dot: 'bg-gray-400',   label: 'Low',    text: 'text-gray-500 dark:text-zinc-400' },
  Medium: { dot: 'bg-amber-500',  label: 'Medium', text: 'text-amber-600 dark:text-amber-400' },
  High:   { dot: 'bg-rose-500',   label: 'High',   text: 'text-rose-600 dark:text-rose-400' },
};

export function LeadRow({ lead: l, onStageChange, onRowClick }: LeadRowProps) {
  const { theme } = useThemeContext();
  const prio = PRIORITY_CONFIG[l.priority];

  const dealStr = l.dealValue >= 1000
    ? `$${(l.dealValue / 1000).toFixed(1)}k`
    : `$${l.dealValue}`;

  return (
    <tr
      className={`${theme.rowHover} border-b border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer`}
      onClick={() => onRowClick(l)}
    >
      {/* Business + Contact */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <p className={`text-sm font-semibold ${theme.textMain} fira-sans-semibold`}>{l.businessName}</p>
        <p className={`text-xs ${theme.textMuted} mt-0.5`}>{l.contactName}</p>
      </td>

      {/* Phone */}
      <td className={`py-3.5 px-4 font-mono text-xs ${theme.textMuted} whitespace-nowrap`}>
        {l.phone}
      </td>

      {/* Email */}
      <td className={`py-3.5 px-4 text-xs ${theme.textMuted} max-w-[180px] truncate`}>
        {l.email}
      </td>

      {/* Deal Value */}
      <td className={`py-3.5 px-4 text-sm font-semibold ${theme.textMain} whitespace-nowrap`}>
        {dealStr}
      </td>

      {/* Priority */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${prio.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${prio.dot} shrink-0`} />
          {prio.label}
        </span>
      </td>

      {/* Assigned To */}
      <td className={`py-3.5 px-4 text-xs font-medium ${theme.textMuted} whitespace-nowrap`}>
        {l.assignedTo}
      </td>

      {/* Stage selector — simple colored text, no chips */}
      <td
        className="py-3.5 px-4 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <select
          value={l.stage}
          onChange={(e) => onStageChange(l.id, e.target.value as LeadStage)}
          aria-label={`Stage for ${l.businessName}`}
          className={`text-xs py-0.5 bg-transparent border-none focus:outline-none cursor-pointer select-clean ${STAGE_TEXT_COLORS[l.stage]}`}
        >
          {LEAD_STAGES.map((s) => (
            <option
              key={s}
              value={s}
              className="bg-white dark:bg-[#18181C] text-[#1E293B] dark:text-[#F3F4F6] font-normal"
            >
              {s}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
