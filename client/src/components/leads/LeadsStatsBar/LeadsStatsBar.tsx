import {
  UsersIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import type { Lead } from '../../../types/lead.types';
import { useThemeContext } from '../../../context/ThemeContext';

interface LeadsStatsBarProps {
  leads: Lead[];
}

interface StatItem {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  iconBgDark: string;
}

export function LeadsStatsBar({ leads }: LeadsStatsBarProps) {
  const { isDarkMode, theme } = useThemeContext();

  const totalLeads   = leads.length;
  const hotLeads     = leads.filter((l) => l.priority === 'High').length;
  const wonLeads     = leads.filter((l) => l.stage === 'Won').length;
  const totalValue   = leads
    .filter((l) => l.stage !== 'Lost')
    .reduce((sum, l) => sum + l.dealValue, 0);

  const pipelineValue = totalValue >= 1000
    ? `$${(totalValue / 1000).toFixed(1)}k`
    : `$${totalValue}`;

  const stats: StatItem[] = [
    {
      label: 'Total Leads',
      value: String(totalLeads),
      sub: 'in pipeline',
      icon: UsersIcon,
      iconColor: 'text-primary',
      iconBg: 'bg-blue-50',
      iconBgDark: 'bg-blue-950/50',
    },
    {
      label: 'Hot Leads',
      value: String(hotLeads),
      sub: 'high priority',
      icon: FireIcon,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50',
      iconBgDark: 'bg-rose-950/50',
    },
    {
      label: 'Deals Won',
      value: String(wonLeads),
      sub: 'this period',
      icon: TrophyIcon,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
      iconBgDark: 'bg-emerald-950/50',
    },
    {
      label: 'Pipeline Value',
      value: pipelineValue,
      sub: 'excl. lost',
      icon: CurrencyDollarIcon,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
      iconBgDark: 'bg-amber-950/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`
            flex items-center gap-3.5 p-4 rounded-xl border
            ${theme.bgPanel} ${theme.border}
            shadow-xs hover:border-primary/40 transition-colors
          `}
        >
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center shrink-0
              ${isDarkMode ? s.iconBgDark : s.iconBg}
            `}
          >
            <s.icon className={`w-5 h-5 ${s.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-[11px] font-medium uppercase tracking-wider ${theme.textSubtle} fira-sans-medium`}>
              {s.label}
            </p>
            <p className={`text-2xl font-bold ${theme.textMain} fira-sans-bold leading-tight`}>
              {s.value}
            </p>
            <p className={`text-[10px] ${theme.textSubtle}`}>{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
