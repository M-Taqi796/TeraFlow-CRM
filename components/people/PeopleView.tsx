'use client';

import { useState, useMemo } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Person, PersonStage, SmartListId } from '@/types/person.types';
import { SmartListsBar } from './SmartListsBar/SmartListsBar';
import { PeopleFilters } from './PeopleFilters/PeopleFilters';
import { PeopleTable } from './PeopleTable/PeopleTable';
import { BulkActionBar } from './BulkActionBar/BulkActionBar';
import { PersonDetailDrawer } from './PersonDetailDrawer/PersonDetailDrawer';
import { NewPersonModal } from './NewPersonModal/NewPersonModal';

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
  const [selectedNiche, setSelectedNiche]         = useState('');
  const [selectedCity, setSelectedCity]           = useState('');

  const [selectedIds, setSelectedIds]             = useState<string[]>([]);
  const [activePerson, setActivePerson]           = useState<Person | null>(null);
  const [isNewPersonOpen, setIsNewPersonOpen]     = useState(false);

  // Smart List Dynamic Counts
  const smartListCounts = useMemo(() => {
    return {
      all:          people.length,
      new_leads:    people.filter((p) => p.stage === 'New Leads').length,
      contacted:    people.filter((p) => p.stage === 'Contacted').length,
      booked:       people.filter((p) => p.stage === 'Booked').length,
      closed:       people.filter((p) => p.stage === 'Closed').length,
      follow_up:    people.filter((p) => p.stage === 'Follow-Up').length,
      denied:       people.filter((p) => p.stage === 'Denied').length,
      past_clients: people.filter((p) => p.stage === 'Past Clients').length,
    };
  }, [people]);

  // Filtering Logic
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      // 1. Smart List Tab
      if (selectedSmartList === 'new_leads' && p.stage !== 'New Leads') return false;
      if (selectedSmartList === 'contacted' && p.stage !== 'Contacted') return false;
      if (selectedSmartList === 'booked' && p.stage !== 'Booked') return false;
      if (selectedSmartList === 'closed' && p.stage !== 'Closed') return false;
      if (selectedSmartList === 'follow_up' && p.stage !== 'Follow-Up') return false;
      if (selectedSmartList === 'denied' && p.stage !== 'Denied') return false;
      if (selectedSmartList === 'past_clients' && p.stage !== 'Past Clients') return false;

      // 2. Stage Filter Dropdown
      if (stageFilter !== 'All' && p.stage !== stageFilter) return false;

      // 3. Tag Filter
      if (selectedTag && !p.tags.includes(selectedTag)) return false;

      // 4. Niche Filter
      if (selectedNiche && p.niche !== selectedNiche) return false;

      // 5. City Filter
      if (selectedCity && p.city !== selectedCity) return false;

      // 6. Search query
      if (searchValue.trim()) {
        const q = searchValue.toLowerCase().trim();
        const matches =
          p.businessName.toLowerCase().includes(q) ||
          (p.contactName && p.contactName.toLowerCase().includes(q)) ||
          p.emails.some((em) => em.toLowerCase().includes(q)) ||
          p.phones.some((ph) => ph.toLowerCase().includes(q)) ||
          (p.niche && p.niche.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [people, selectedSmartList, stageFilter, selectedTag, selectedNiche, selectedCity, searchValue]);

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
    setSelectedNiche('');
    setSelectedCity('');
    setSelectedSmartList('all');
  };

  const hasActiveFilters =
    Boolean(searchValue) ||
    stageFilter !== 'All' ||
    Boolean(selectedTag) ||
    Boolean(selectedNiche) ||
    Boolean(selectedCity) ||
    selectedSmartList !== 'all';

  // Tag editing directly on table row
  const handleAddTagToPerson = (personId: string, tag: string) => {
    const p = people.find((x) => x.id === personId);
    if (!p) return;
    if (p.tags.includes(tag)) return;
    const act = {
      id: `act-${Date.now()}`,
      type: 'tag_added' as const,
      title: `Tag Added (#${tag})`,
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
    const act = {
      id: `act-${Date.now()}`,
      type: 'tag_removed' as const,
      title: `Tag Removed (#${tag})`,
      description: `Removed #${tag}`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...p,
      tags: p.tags.filter((t) => t !== tag),
      activities: [act, ...(p.activities || [])],
    });
  };

  // Export CSV
  const handleExportSelected = () => {
    const targetPeople = people.filter((p) => selectedIds.includes(p.id));
    const headers = ['Business Name', 'Contact Name', 'Phones', 'Emails', 'Tags', 'Niche', 'City', 'Stage', 'Notes'];
    const rows = targetPeople.map((p) => [
      `"${p.businessName}"`,
      `"${p.contactName || ''}"`,
      `"${p.phones.join('; ')}"`,
      `"${p.emails.join('; ')}"`,
      `"${p.tags.join(', ')}"`,
      `"${p.niche}"`,
      `"${p.city}"`,
      `"${p.stage}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TeraFlow_Contacts_Export_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Manage contacts, manual calling &amp; emailing, niches, and pipeline stages.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMuted}`}>
            Total Contacts: <strong className={theme.textMain}>{people.length}</strong>
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
        selectedNiche={selectedNiche}
        onSelectedNicheChange={setSelectedNiche}
        selectedCity={selectedCity}
        onSelectedCityChange={setSelectedCity}
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

      {/* Centered Popup Contact Detail Modal */}
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

      {/* New Contact Modal */}
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
