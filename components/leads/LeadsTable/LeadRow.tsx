import type { Lead, LeadStage, LeadPriority } from '@/types/lead.types';
import { LEAD_STAGES } from '@/types/lead.types';
import { useThemeContext } from '@/context/ThemeContext';

interface LeadRowProps {
  lead: Lead;
  onStageChange: (id: string, stage: LeadStage) => void;
  onRowClick: (lead: Lead) => void;
}

const STAGE_COLORS_LIGHT: Record<LeadStage, string> = {
  'New':           'bg-gray-100 text-gray-700 border-gray-300',
  'Contacted':     'bg-blue-50 text-primary border-primary/40',
  'Qualified':     'bg-violet-50 text-violet-700 border-violet-300',
  'Proposal Sent': 'bg-amber-50 text-amber-700 border-amber-300',
  'Negotiation':   'bg-orange-50 text-orange-700 border-orange-300',
  'Won':           'bg-emerald-50 text-emerald-700 border-emerald-300',
  'Lost':          'bg-rose-50 text-rose-700 border-rose-300',
};

const STAGE_COLORS_DARK: Record<LeadStage, string> = {
  'New':           'bg-zinc-800 text-zinc-300 border-zinc-700',
  'Contacted':     'bg-blue-950/70 text-blue-300 border-blue-800',
  'Qualified':     'bg-violet-950/70 text-violet-300 border-violet-800',
  'Proposal Sent': 'bg-amber-950/70 text-amber-300 border-amber-800',
  'Negotiation':   'bg-orange-950/70 text-orange-300 border-orange-800',
  'Won':           'bg-emerald-950/70 text-emerald-300 border-emerald-800',
  'Lost':          'bg-rose-950/70 text-rose-300 border-rose-800',
};

const PRIORITY_CONFIG: Record<LeadPriority, { dot: string; label: string; textLight: string; textDark: string }> = {
  Low:    { dot: 'bg-gray-400',   label: 'Low',    textLight: 'text-gray-500',  textDark: 'text-zinc-400' },
  Medium: { dot: 'bg-amber-500',  label: 'Medium', textLight: 'text-amber-600', textDark: 'text-amber-400' },
  High:   { dot: 'bg-rose-500',   label: 'High',   textLight: 'text-rose-600',  textDark: 'text-rose-400' },
};

export function LeadRow({ lead: l, onStageChange, onRowClick }: LeadRowProps) {
  const { isDarkMode, theme } = useThemeContext();

  const stageClass = isDarkMode ? STAGE_COLORS_DARK[l.stage] : STAGE_COLORS_LIGHT[l.stage];
  const prio       = PRIORITY_CONFIG[l.priority];

  const dealStr = l.dealValue >= 1000
    ? `$${(l.dealValue / 1000).toFixed(1)}k`
    : `$${l.dealValue}`;

  return (
    <tr
      className={`${theme.rowHover} transition-colors cursor-pointer`}
      onClick={() => onRowClick(l)}
    >
      {/* Business + Contact */}
      <td className="py-3.5 px-4">
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
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? prio.textDark : prio.textLight}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${prio.dot} shrink-0`} />
          {prio.label}
        </span>
      </td>

      {/* Assigned To */}
      <td className={`py-3.5 px-4 text-xs font-medium ${theme.textMuted} whitespace-nowrap`}>
        {l.assignedTo}
      </td>

      {/* Stage selector — stops row click propagation */}
      <td
        className="py-3.5 px-4 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <select
          value={l.stage}
          onChange={(e) => onStageChange(l.id, e.target.value as LeadStage)}
          aria-label={`Stage for ${l.businessName}`}
          className={`text-xs font-semibold py-1 px-2.5 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${stageClass}`}
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
      </td>
    </tr>
  );
}
