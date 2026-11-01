'use client';

import { useState, useMemo } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Person, PersonStage, SmartListId } from '@/types/person.types';
import { SmartListsBar } from './SmartListsBar/SmartListsBar';
import { PeopleFilters, type LastActivityFilter } from './PeopleFilters/PeopleFilters';
import { PeopleTable } from './PeopleTable/PeopleTable';
import { BulkActionBar } from './BulkActionBar/BulkActionBar';
import { PersonDetailDrawer } from './PersonDetailDrawer/PersonDetailDrawer';
import { NewPersonModal } from './NewPersonModal/NewPersonModal';
import type { ColumnConfig } from './ColumnsCustomizer/ColumnsCustomizer';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Person / Contact', visible: true, canToggle: false },
  { id: 'stage', label: 'Stage', visible: true, canToggle: true },
  { id: 'tags', label: 'Tags', visible: true, canToggle: true },
  { id: 'phone', label: 'Phone', visible: true, canToggle: true },
  { id: 'email', label: 'Email', visible: true, canToggle: true },
  { id: 'source', label: 'Source', visible: true, canToggle: true },
  { id: 'lastActivity', label: 'Last Activity', visible: true, canToggle: true },
  { id: 'dealValue', label: 'Est. Value', visible: true, canToggle: true },
  { id: 'assignedTo', label: 'Assigned Agent', visible: false, canToggle: true },
  { id: 'createdAt', label: 'Created Date', visible: false, canToggle: true },
];

export function PeopleView() {
  const { theme } = useThemeContext();
  const {
    people,
    onPersonStageChange,
    onUpdatePerson,
    onCreatePerson,
    onDeletePerson,
    onBulkTag,
    onBulkStage,
    onBulkDelete,
  } = useCRM();

  // State
  const [selectedSmartList, setSelectedSmartList] = useState<SmartListId>('all');
  const [searchValue, setSearchValue]             = useState('');
  const [stageFilter, setStageFilter]             = useState<'All' | PersonStage>('All');
  const [selectedTag, setSelectedTag]             = useState('');
  const [activityFilter, setActivityFilter]       = useState<LastActivityFilter>('all');
  const [assigneeFilter, setAssigneeFilter]       = useState('all');

  const [selectedIds, setSelectedIds]             = useState<string[]>([]);
  const [activePerson, setActivePerson]           = useState<Person | null>(null);
  const [isNewPersonOpen, setIsNewPersonOpen]     = useState(false);
  const [columns, setColumns]                     = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Column toggles
  const handleToggleColumn = (id: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id && c.canToggle ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleResetColumns = () => {
    setColumns(DEFAULT_COLUMNS);
  };

  // Smart List Dynamic Counts
  const smartListCounts = useMemo(() => {
    return {
      all: people.length,
      new_leads: people.filter((p) => p.stage === 'Lead').length,
      recently_active: people.filter((p) => {
        const lower = p.lastActivity.relativeTime.toLowerCase();
        return lower.includes('hour') || lower.includes('min') || lower.includes('yesterday') || lower.includes('1 day');
      }).length,
      hot_prospects: people.filter((p) => p.stage === 'Hot Prospect' || p.stage === 'Negotiation').length,
      nurture: people.filter((p) => {
        const lower = p.lastActivity.relativeTime.toLowerCase();
        return lower.includes('day') && (parseInt(lower) > 10 || lower.includes('14') || lower.includes('18'));
      }).length,
      unassigned: people.filter((p) => p.assignedTo.toLowerCase().includes('unassigned') || p.assignedTo.toLowerCase().includes('pond')).length,
    };
  }, [people]);

  // Filtering Logic
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      // 1. Smart List condition
      if (selectedSmartList === 'new_leads' && p.stage !== 'Lead') return false;
      if (selectedSmartList === 'recently_active') {
        const lower = p.lastActivity.relativeTime.toLowerCase();
        const isRecent = lower.includes('hour') || lower.includes('min') || lower.includes('yesterday') || lower.includes('1 day');
        if (!isRecent) return false;
      }
      if (selectedSmartList === 'hot_prospects' && p.stage !== 'Hot Prospect' && p.stage !== 'Negotiation') {
        return false;
      }
      if (selectedSmartList === 'nurture') {
        const lower = p.lastActivity.relativeTime.toLowerCase();
        const isNurture = lower.includes('day') && (parseInt(lower) > 10 || lower.includes('14') || lower.includes('18'));
        if (!isNurture) return false;
      }
      if (selectedSmartList === 'unassigned') {
        const isUnassigned = p.assignedTo.toLowerCase().includes('unassigned') || p.assignedTo.toLowerCase().includes('pond');
        if (!isUnassigned) return false;
      }

      // 2. Stage Filter
      if (stageFilter !== 'All' && p.stage !== stageFilter) return false;

      // 3. Tag Filter
      if (selectedTag && !p.tags.includes(selectedTag)) return false;

      // 4. Assignee Filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          const isUn = p.assignedTo.toLowerCase().includes('unassigned') || p.assignedTo.toLowerCase().includes('pond');
          if (!isUn) return false;
        } else if (p.assignedTo !== assigneeFilter) {
          return false;
        }
      }

      // 5. Activity Filter
      if (activityFilter !== 'all') {
        const lower = p.lastActivity.relativeTime.toLowerCase();
        if (activityFilter === 'today' && !lower.includes('hour') && !lower.includes('min')) return false;
        if (activityFilter === '7days' && !lower.includes('hour') && !lower.includes('min') && !lower.includes('yesterday') && !lower.includes('1 day') && !lower.includes('3 day')) return false;
        if (activityFilter === 'older30' && !lower.includes('14 day') && !lower.includes('18 day') && !lower.includes('month')) return false;
      }

      // 6. Search query
      if (searchValue.trim()) {
        const q = searchValue.toLowerCase().trim();
        const matches =
          p.contactName.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [people, selectedSmartList, stageFilter, selectedTag, assigneeFilter, activityFilter, searchValue]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredPeople.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPeople.map((p) => p.id));
    }
  };

  const handleResetAllFilters = () => {
    setSearchValue('');
    setStageFilter('All');
    setSelectedTag('');
    setActivityFilter('all');
    setAssigneeFilter('all');
    setSelectedSmartList('all');
  };

  const hasActiveFilters =
    Boolean(searchValue) ||
    stageFilter !== 'All' ||
    Boolean(selectedTag) ||
    activityFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    selectedSmartList !== 'all';

  // Tag editing on table row
  const handleAddTagToPerson = (personId: string, tag: string) => {
    const p = people.find((x) => x.id === personId);
    if (!p) return;
    if (p.tags.includes(tag)) return;
    const act = {
      id: `act-${Date.now()}`,
      type: 'tag_added' as const,
      title: 'Tag Added',
      description: `Added #${tag}`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...p,
      tags: [...p.tags, tag],
      activities: [act, ...(p.activities || [])],
    });
  };

  const handleRemoveTagFromPerson = (personId: string, tag: string) => {
    const p = people.find((x) => x.id === personId);
    if (!p) return;
    onUpdatePerson({
      ...p,
      tags: p.tags.filter((t) => t !== tag),
    });
  };

  // Export CSV
  const handleExportSelected = () => {
    const targetPeople = people.filter((p) => selectedIds.includes(p.id));
    const headers = ['Name', 'Business', 'Phone', 'Email', 'Stage', 'Tags', 'Deal Value', 'Source', 'Location'];
    const rows = targetPeople.map((p) => [
      `"${p.contactName}"`,
      `"${p.businessName}"`,
      `"${p.phone}"`,
      `"${p.email}"`,
      `"${p.stage}"`,
      `"${p.tags.join(', ')}"`,
      p.dealValue,
      `"${p.source}"`,
      `"${p.location}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FollowUpBoss_People_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold ${theme.textMain} fira-sans-bold tracking-tight`}>
            People
          </h1>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            Follow Up Boss contact management &bull; Smart lists, multi-tag filtering, and activity pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMuted}`}>
            Total Database: <strong className={theme.textMain}>{people.length}</strong>
          </span>
          <span className={`px-2.5 py-1 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMuted}`}>
            Filtered: <strong className="text-primary">{filteredPeople.length}</strong>
          </span>
        </div>
      </div>

      {/* Smart Lists Bar */}
      <SmartListsBar
        selectedList={selectedSmartList}
        onSelectList={(id) => {
          setSelectedSmartList(id);
          setSelectedIds([]);
        }}
        counts={smartListCounts}
      />

      {/* Filters Bar */}
      <PeopleFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        selectedTag={selectedTag}
        onSelectedTagChange={setSelectedTag}
        activityFilter={activityFilter}
        onActivityFilterChange={setActivityFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        columns={columns}
        onToggleColumn={handleToggleColumn}
        onResetColumns={handleResetColumns}
        onOpenNewPerson={() => setIsNewPersonOpen(true)}
        onResetAllFilters={handleResetAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* People Table */}
      <PeopleTable
        people={filteredPeople}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onSelectPerson={setActivePerson}
        onStageChange={onPersonStageChange}
        onAddTag={handleAddTagToPerson}
        onRemoveTag={handleRemoveTagFromPerson}
        columns={columns}
      />

      {/* Floating Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkTag={(tag) => {
          onBulkTag(selectedIds, tag);
          setSelectedIds([]);
        }}
        onBulkStage={(stage) => {
          onBulkStage(selectedIds, stage);
          setSelectedIds([]);
        }}
        onBulkDelete={() => {
          onBulkDelete(selectedIds);
          setSelectedIds([]);
        }}
        onExportSelected={handleExportSelected}
      />

      {/* Person Detail Drawer */}
      <PersonDetailDrawer
        person={activePerson}
        onClose={() => setActivePerson(null)}
        onUpdatePerson={(updated) => {
          onUpdatePerson(updated);
          setActivePerson(updated);
        }}
        onDeletePerson={(id) => {
          onDeletePerson(id);
          setActivePerson(null);
        }}
      />

      {/* New Person Modal */}
      <NewPersonModal
        isOpen={isNewPersonOpen}
        onClose={() => setIsNewPersonOpen(false)}
        onCreate={(p) => {
          onCreatePerson(p);
          setActivePerson(p);
        }}
      />
    </div>
  );
}
