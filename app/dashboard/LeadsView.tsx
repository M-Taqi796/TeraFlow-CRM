'use client';

import { useState, useMemo } from 'react';
import type { Lead, LeadStage, LeadPriority } from '@/types/lead.types';
import { LeadsStatsBar } from '@/components/leads/LeadsStatsBar';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { NewLeadModal } from '@/components/leads/NewLeadModal';
import { useThemeContext } from '@/context/ThemeContext';

interface LeadsViewProps {
  leads: Lead[];
  onStageChange: (id: string, stage: LeadStage) => void;
  onUpdateLead: (updated: Lead) => void;
  onCreateLead: (newLead: Lead) => void;
}

export function LeadsView({ leads, onStageChange, onUpdateLead, onCreateLead }: LeadsViewProps) {
  const { theme } = useThemeContext();

  const [searchValue, setSearchValue]       = useState('');
  const [stageFilter, setStageFilter]       = useState<'All' | LeadStage>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | LeadPriority>('All');
  const [selectedLead, setSelectedLead]     = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen]   = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStage    = stageFilter === 'All' || lead.stage === stageFilter;
      const matchesPriority = priorityFilter === 'All' || lead.priority === priorityFilter;
      const q = searchValue.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.businessName.toLowerCase().includes(q) ||
        lead.contactName.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.assignedTo.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        lead.source.toLowerCase().includes(q);
      return matchesStage && matchesPriority && matchesSearch;
    });
  }, [leads, searchValue, stageFilter, priorityFilter]);

  const handleSaveLead = (updated: Lead) => {
    onUpdateLead(updated);
    setSelectedLead(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme.textMain} fira-sans-bold tracking-tight`}>
            Leads Management
          </h1>
          <p className={`text-xs ${theme.textMuted} mt-1`}>
            Track, qualify, and convert potential opportunities across your pipeline.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <LeadsStatsBar leads={leads} />

      {/* Filterable Leads Table */}
      <LeadsTable
        leads={filteredLeads}
        totalCount={leads.length}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onStageChange={onStageChange}
        onSelectLead={(lead) => setSelectedLead(lead)}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
      />

      {/* Slide-over Lead Detail Drawer */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSave={handleSaveLead}
        />
      )}

      {/* Add Lead Modal */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={onCreateLead}
      />
    </div>
  );
}
