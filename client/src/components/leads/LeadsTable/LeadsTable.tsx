import { UsersIcon } from '@heroicons/react/24/outline';
import type { Lead, LeadStage, LeadPriority } from '../../../types/lead.types';
import { LeadRow } from './LeadRow';
import { LeadsFilters } from './LeadsFilters';
import { useThemeContext } from '../../../context/ThemeContext';

interface LeadsTableProps {
  leads: Lead[];
  totalCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  stageFilter: 'All' | LeadStage;
  onStageFilterChange: (stage: 'All' | LeadStage) => void;
  priorityFilter: 'All' | LeadPriority;
  onPriorityFilterChange: (priority: 'All' | LeadPriority) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenNewLead: () => void;
}

export function LeadsTable({
  leads,
  totalCount,
  searchValue,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onStageChange,
  onSelectLead,
  onOpenNewLead,
}: LeadsTableProps) {
  const { isDarkMode, theme } = useThemeContext();

  return (
    <div className={`${theme.bgPanel} rounded-xl border ${theme.border} shadow-xs overflow-hidden`}>
      {/* Table Header / Action Bar */}
      <div className={`p-4 border-b ${theme.border} flex flex-col lg:flex-row lg:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-primary" />
          <h2 className={`text-base font-bold ${theme.textMain} fira-sans-bold`}>
            All Leads
          </h2>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isDarkMode
                ? 'bg-blue-950/70 text-blue-300 border-blue-800'
                : 'bg-blue-50 text-primary border-primary/20'
            } border ml-1`}
          >
            {leads.length} {leads.length !== totalCount && `/ ${totalCount}`}
          </span>
        </div>

        <LeadsFilters
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          stageFilter={stageFilter}
          onStageFilterChange={onStageFilterChange}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={onPriorityFilterChange}
          onOpenNewLead={onOpenNewLead}
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
              <th className="py-3 px-4">Business & Contact</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Value</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Stage</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme.border} text-xs`}>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className={`py-12 text-center ${theme.textSubtle}`}>
                  <p className="text-sm font-medium mb-1">No leads found matching your filters.</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your search query or stage filters.</p>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onStageChange={onStageChange}
                  onRowClick={onSelectLead}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
