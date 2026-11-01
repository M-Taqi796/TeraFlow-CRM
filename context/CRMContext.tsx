'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Person, PersonStage } from '@/types/person.types';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import type { Task } from '@/types/task.types';
import { SEED_PEOPLE } from '@/data/people.data';
import { SEED_MEETINGS } from '@/data/meetings.data';
import { SEED_TASKS } from '@/data/tasks.data';

import { COMMON_TAGS, DEFAULT_NICHES, DEFAULT_CITIES } from '@/types/person.types';

interface CRMContextType {
  people: Person[];
  meetings: Meeting[];
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  navCounts: Record<string, number>;
  allTags: string[];
  onAddGlobalTag: (tag: string) => void;
  customNiches: string[];
  onAddCustomNiche: (niche: string) => void;
  customCities: string[];
  onAddCustomCity: (city: string) => void;
  isNewLeadModalOpen: boolean;
  openNewLeadModal: () => void;
  closeNewLeadModal: () => void;
  onPersonStageChange: (id: string, stage: PersonStage) => void;
  onUpdatePerson: (updated: Person) => void;
  onCreatePerson: (newPerson: Person) => void;
  onBulkCreatePeople: (newPeople: Person[]) => void;
  onDeletePerson: (id: string) => void;
  onBulkTag: (ids: string[], tag: string) => void;
  onBulkStage: (ids: string[], stage: PersonStage) => void;
  onBulkDelete: (ids: string[]) => void;
  onMeetingStatusChange: (id: string, status: MeetingStatus) => void;
  onCompleteTask: (taskId: string, comment: string) => void;
  onLogout: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople]     = useState<Person[]>(SEED_PEOPLE);
  const [meetings, setMeetings] = useState<Meeting[]>(SEED_MEETINGS);
  const [tasks, setTasks]       = useState<Task[]>(SEED_TASKS);

  // New Lead Modal
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const openNewLeadModal = () => setIsNewLeadModalOpen(true);
  const closeNewLeadModal = () => setIsNewLeadModalOpen(false);

  // Global tag registry (starts with COMMON_TAGS + seed tags)
  const [allTags, setAllTags] = useState<string[]>(() => {
    const seedTags = SEED_PEOPLE.flatMap((p) => p.tags);
    const set = new Set([...COMMON_TAGS, ...seedTags]);
    return Array.from(set);
  });

  const handleAddGlobalTag = (tag: string) => {
    const clean = tag.trim().replace(/^#/, '');
    if (!clean) return;
    setAllTags((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  };

  // Custom niches and cities
  const [customNiches, setCustomNiches] = useState<string[]>([]);
  const [customCities, setCustomCities] = useState<string[]>([]);

  const handleAddCustomNiche = (niche: string) => {
    const clean = niche.trim();
    if (!clean) return;
    setCustomNiches((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  };

  const handleAddCustomCity = (city: string) => {
    const clean = city.trim();
    if (!clean) return;
    setCustomCities((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  };

  const activeTasks    = useMemo(() => tasks.filter((t) => t.status === 'TODO'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'COMPLETED'), [tasks]);

  const navCounts: Record<string, number> = useMemo(() => ({
    People:   people.length,
    Tasks:    activeTasks.length,
    Meetings: meetings.filter((m) => m.status === 'Scheduled').length,
  }), [people.length, activeTasks.length, meetings]);

  const handlePersonStageChange = (id: string, stage: PersonStage) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newAct = {
          id: `act-${Date.now()}`,
          type: 'stage_change' as const,
          title: 'Stage Changed',
          description: `Stage moved from ${p.stage} to ${stage}.`,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          author: 'Muhammad Taqi',
        };
        return {
          ...p,
          stage,
          activities: [newAct, ...(p.activities || [])],
        };
      })
    );
  };

  const handleUpdatePerson = (updated: Person) => {
    setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleCreatePerson = (newPerson: Person) => {
    setPeople((prev) => [newPerson, ...prev]);
    // Also register any new tags
    newPerson.tags.forEach(handleAddGlobalTag);
  };

  const handleBulkCreatePeople = (newPeople: Person[]) => {
    setPeople((prev) => [...newPeople, ...prev]);
    newPeople.forEach((p) => p.tags.forEach(handleAddGlobalTag));
  };

  const handleDeletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const handleBulkTag = (ids: string[], tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (!cleanTag) return;
    handleAddGlobalTag(cleanTag);
    setPeople((prev) =>
      prev.map((p) => {
        if (!ids.includes(p.id)) return p;
        if (p.tags.includes(cleanTag)) return p;
        const newAct = {
          id: `act-${Date.now()}-${p.id}`,
          type: 'tag_added' as const,
          title: 'Tag Added',
          description: `Added tag "${cleanTag}" via bulk actions.`,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          author: 'Muhammad Taqi',
        };
        return {
          ...p,
          tags: [...p.tags, cleanTag],
          activities: [newAct, ...(p.activities || [])],
        };
      })
    );
  };

  const handleBulkStage = (ids: string[], stage: PersonStage) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (!ids.includes(p.id)) return p;
        const newAct = {
          id: `act-${Date.now()}-${p.id}`,
          type: 'stage_change' as const,
          title: 'Stage Changed',
          description: `Stage moved to ${stage} via bulk actions.`,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          author: 'Muhammad Taqi',
        };
        return {
          ...p,
          stage,
          activities: [newAct, ...(p.activities || [])],
        };
      })
    );
  };

  const handleBulkDelete = (ids: string[]) => {
    setPeople((prev) => prev.filter((p) => !ids.includes(p.id)));
  };

  const handleMeetingStatusChange = (id: string, status: MeetingStatus) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleCompleteTask = (taskId: string, comment: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED', completionComment: comment, completedAt: 'Just now' }
          : t
      )
    );
  };

  const handleLogout = () => {
    alert('Logged out successfully.');
  };

  return (
    <CRMContext.Provider
      value={{
        people,
        meetings,
        tasks,
        activeTasks,
        completedTasks,
        navCounts,
        allTags,
        onAddGlobalTag: handleAddGlobalTag,
        customNiches,
        onAddCustomNiche: handleAddCustomNiche,
        customCities,
        onAddCustomCity: handleAddCustomCity,
        isNewLeadModalOpen,
        openNewLeadModal,
        closeNewLeadModal,
        onPersonStageChange: handlePersonStageChange,
        onUpdatePerson: handleUpdatePerson,
        onCreatePerson: handleCreatePerson,
        onBulkCreatePeople: handleBulkCreatePeople,
        onDeletePerson: handleDeletePerson,
        onBulkTag: handleBulkTag,
        onBulkStage: handleBulkStage,
        onBulkDelete: handleBulkDelete,
        onMeetingStatusChange: handleMeetingStatusChange,
        onCompleteTask: handleCompleteTask,
        onLogout: handleLogout,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
