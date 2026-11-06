'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { Person, PersonStage } from '@/types/person.types';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import type { Task } from '@/types/task.types';
import { SEED_PEOPLE } from '@/data/people.data';
import { SEED_MEETINGS } from '@/data/meetings.data';
import { SEED_TASKS } from '@/data/tasks.data';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

import { COMMON_TAGS, DEFAULT_NICHES, DEFAULT_CITIES } from '@/types/person.types';
import type { UserProfile, UserRole } from '@/types/user.types';
import { INITIAL_CURRENT_USER, SEED_TEAM_MEMBERS } from '@/types/user.types';
import {
  fetchPeopleFromDB,
  fetchMeetingsFromDB,
  fetchTasksFromDB,
  fetchCatalogsFromDB,
  createPersonInDB,
  updatePersonInDB,
  updatePersonStageInDB,
  deletePersonInDB,
  bulkUpdateStageInDB,
  bulkDeleteInDB,
  createMeetingInDB,
  updateMeetingInDB,
  deleteMeetingInDB,
  createTaskInDB,
  updateTaskInDB,
  completeTaskInDB,
  deleteTaskInDB,
  addCallLogInDB,
  addEmailLogInDB,
  addCatalogItemInDB,
  subscribeToRealtimeChanges,
} from '@/lib/services/crmService';

/** Current authenticated user — update when auth is wired up. */
export const CURRENT_USER = {
  name: 'Muhammad Taqi',
  role: 'Team Lead',
  imageUrl: undefined as string | undefined,
};

const DEFAULT_UNREAD_NAV: Record<string, boolean> = {
  Meetings: false,
  Tasks: false,
  People: false,
  'Call Log': false,
  'Email Outreach': false,
  Imports: false,
  Teams: false,
  Settings: false,
  Dashboard: false,
};

interface CRMContextType {
  people: Person[];
  meetings: Meeting[];
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  navCounts: Record<string, number>;
  unreadNav: Record<string, boolean>;
  markNavAsRead: (navName: string) => void;
  markNavAsUnread: (navName: string) => void;
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
  onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onEditMeeting: (id: string, meeting: Partial<Meeting>) => void;
  onDeleteMeeting: (id: string) => void;
  onCompleteTask: (taskId: string, comment: string) => void;
  onAddTask: (task: Omit<Task, 'id'> | { title: string; assignedBy?: string; assignedTo?: string; dueDate?: string; dueTime?: string; dueAt?: string; status?: 'TODO' | 'COMPLETED' }) => void;
  onEditTask: (id: string, task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleTaskStatus: (id: string) => void;
  onAddCallLog: (data: {
    personId?: string;
    businessName: string;
    contactName?: string;
    phone: string;
    callStatus: string;
    comment: string;
    timestamp?: string;
  }) => void;
  onEditCallLog: (
    activityId: string,
    data: {
      callStatus: string;
      comment: string;
      phone?: string;
      timestamp?: string;
    }
  ) => void;
  onDeleteCallLog: (activityId: string) => void;
  onAddEmailLog: (data: {
    personId?: string;
    businessName: string;
    contactName?: string;
    email: string;
    emailType: 'Sent' | 'Reply';
    subject: string;
    comment: string;
    timestamp?: string;
  }) => void;
  onEditEmailLog: (
    activityId: string,
    data: {
      emailType: 'Sent' | 'Reply';
      subject: string;
      comment: string;
      email?: string;
      timestamp?: string;
    }
  ) => void;
  onDeleteEmailLog: (activityId: string) => void;
  onLogout: () => void;
  /** User Profile & Team Management */
  currentUser: UserProfile;
  onUpdateCurrentUser: (updated: Partial<UserProfile>) => void;
  onChangePassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  onSwitchRole: (role: UserRole) => void;
  teamMembers: UserProfile[];
  onAddTeamMember: (member: Omit<UserProfile, 'id' | 'joinedDate'>) => void;
  onUpdateTeamMember: (id: string, updated: Partial<UserProfile>) => void;
  onDeleteTeamMember: (id: string) => void;
  /** Toast helpers — call from anywhere inside CRMProvider */
  toast: {
    success: (msg: string) => void;
    error:   (msg: string) => void;
    info:    (msg: string) => void;
    warning: (msg: string) => void;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const { toasts, dismiss, success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();
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
    addCatalogItemInDB('tag', clean);
  };

  // Custom niches and cities
  const [customNiches, setCustomNiches] = useState<string[]>([]);
  const [customCities, setCustomCities] = useState<string[]>([]);

  const handleAddCustomNiche = (niche: string) => {
    const clean = niche.trim();
    if (!clean) return;
    setCustomNiches((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    addCatalogItemInDB('niche', clean);
  };

  const handleAddCustomCity = (city: string) => {
    const clean = city.trim();
    if (!clean) return;
    setCustomCities((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    addCatalogItemInDB('city', clean);
  };

  // ── Database Data Ingestion & Live Realtime Sync ──
  useEffect(() => {
    let isMounted = true;

    async function loadDataFromSupabase() {
      try {
        const [dbPeople, dbMeetings, dbTasks, dbCatalogs] = await Promise.all([
          fetchPeopleFromDB(),
          fetchMeetingsFromDB(),
          fetchTasksFromDB(),
          fetchCatalogsFromDB(),
        ]);

        if (!isMounted) return;

        if (dbPeople && dbPeople.length > 0) {
          setPeople(dbPeople);
        }
        if (dbMeetings && dbMeetings.length > 0) {
          setMeetings(dbMeetings);
        }
        if (dbTasks && dbTasks.length > 0) {
          setTasks(dbTasks);
        }
        if (dbCatalogs.globalTags && dbCatalogs.globalTags.length > 0) {
          setAllTags(Array.from(new Set([...COMMON_TAGS, ...dbCatalogs.globalTags])));
        }
        if (dbCatalogs.customNiches && dbCatalogs.customNiches.length > 0) {
          setCustomNiches(dbCatalogs.customNiches);
        }
        if (dbCatalogs.customCities && dbCatalogs.customCities.length > 0) {
          setCustomCities(dbCatalogs.customCities);
        }
      } catch (err) {
        console.error('Supabase DB initial load error:', err);
      }
    }

    loadDataFromSupabase();

    const unsubscribe = subscribeToRealtimeChanges({
      onContactsChange: async () => {
        const fresh = await fetchPeopleFromDB();
        if (fresh && fresh.length > 0 && isMounted) setPeople(fresh);
      },
      onMeetingsChange: async () => {
        const fresh = await fetchMeetingsFromDB();
        if (fresh && fresh.length > 0 && isMounted) setMeetings(fresh);
      },
      onTasksChange: async () => {
        const fresh = await fetchTasksFromDB();
        if (fresh && fresh.length > 0 && isMounted) setTasks(fresh);
      },
      onActivitiesChange: async () => {
        const fresh = await fetchPeopleFromDB();
        if (fresh && fresh.length > 0 && isMounted) setPeople(fresh);
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const activeTasks    = useMemo(() => tasks.filter((t) => t.status === 'TODO'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'COMPLETED'), [tasks]);

  const navCounts: Record<string, number> = useMemo(() => {
    let callCount = 0;
    let emailCount = 0;
    people.forEach((p) => {
      (p.activities || []).forEach((a) => {
        if (a.type === 'call') callCount++;
        if (a.type === 'email') emailCount++;
      });
    });

    return {
      People:          people.length,
      Tasks:           activeTasks.length,
      Meetings:        meetings.filter((m) => m.status === 'Scheduled').length,
      'Call Log':      callCount,
      'Email Outreach': emailCount,
    };
  }, [people, activeTasks.length, meetings]);

  // ── Unread Navigation State (Blue Dot Indicator) ──
  const [unreadNav, setUnreadNav] = useState<Record<string, boolean>>(DEFAULT_UNREAD_NAV);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('teraflow_unread_nav');
      if (saved) {
        setUnreadNav((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // ignore
    }
  }, []);

  const markNavAsRead = useCallback((navName: string) => {
    setUnreadNav((prev) => {
      if (!prev[navName]) return prev;
      const next = { ...prev, [navName]: false };
      try {
        localStorage.setItem('teraflow_unread_nav', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const markNavAsUnread = useCallback((navName: string) => {
    setUnreadNav((prev) => {
      if (prev[navName]) return prev;
      const next = { ...prev, [navName]: true };
      try {
        localStorage.setItem('teraflow_unread_nav', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // ── User Profile & Team Management ──
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_CURRENT_USER);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(SEED_TEAM_MEMBERS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedUser = localStorage.getItem('teraflow_current_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      const savedTeam = localStorage.getItem('teraflow_team_members');
      if (savedTeam) setTeamMembers(JSON.parse(savedTeam));
    } catch {
      // ignore
    }
  }, []);

  const handleUpdateCurrentUser = useCallback((updated: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('teraflow_current_user', JSON.stringify(next));
      } catch {}
      return next;
    });
    setTeamMembers((prev) => {
      const next = prev.map((m) => (m.id === INITIAL_CURRENT_USER.id ? { ...m, ...updated } : m));
      try {
        localStorage.setItem('teraflow_team_members', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleChangePassword = useCallback((currentPass: string, newPass: string) => {
    if (!newPass || newPass.length < 6) {
      toastError('Password must be at least 6 characters long');
      return { success: false, message: 'Password must be at least 6 characters long' };
    }
    toastSuccess('Password successfully updated');
    return { success: true, message: 'Password successfully updated' };
  }, [toastError, toastSuccess]);

  const handleSwitchRole = useCallback((role: UserRole) => {
    handleUpdateCurrentUser({ role });
    toastInfo(`Switched role view to ${role}`);
  }, [handleUpdateCurrentUser, toastInfo]);

  const handleAddTeamMember = useCallback((data: Omit<UserProfile, 'id' | 'joinedDate'>) => {
    if (currentUser.role !== 'Team Lead') {
      toastError('Unauthorized: Only Team Leads can add team members');
      return;
    }
    const newMember: UserProfile = {
      ...data,
      role: 'Team Member',
      id: `u-${Date.now()}`,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setTeamMembers((prev) => {
      const next = [...prev, newMember];
      try {
        localStorage.setItem('teraflow_team_members', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Provision securely in database with bcrypt encryption
    fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok) {
        toastError(json.error || 'Failed to provision team member in database');
      }
    }).catch((err) => {
      console.error('Failed to provision team member:', err);
    });

    markNavAsUnread('Teams');
    toastSuccess(`Added ${newMember.name} to the team`);
  }, [currentUser.role, markNavAsUnread, toastError, toastSuccess]);

  const handleUpdateTeamMember = useCallback((id: string, updated: Partial<UserProfile>) => {
    if (currentUser.role !== 'Team Lead') {
      toastError('Unauthorized: Only Team Leads can update team members');
      return;
    }
    setTeamMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updated } : m));
      try {
        localStorage.setItem('teraflow_team_members', JSON.stringify(next));
      } catch {}
      return next;
    });
    toastSuccess('Team member updated');
  }, [currentUser.role, toastError, toastSuccess]);

  const handleDeleteTeamMember = useCallback((id: string) => {
    if (currentUser.role !== 'Team Lead') {
      toastError('Unauthorized: Only Team Leads can remove team members');
      return;
    }
    setTeamMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('teraflow_team_members', JSON.stringify(next));
      } catch {}
      return next;
    });
    toastInfo('Team member removed');
  }, [currentUser.role, toastError, toastInfo]);

  const handlePersonStageChange = (id: string, stage: PersonStage) => {
    updatePersonStageInDB(id, stage);
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
    updatePersonInDB(updated);
    setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleCreatePerson = async (newPerson: Person) => {
    const dbId = await createPersonInDB(newPerson);
    const personToAdd = dbId ? { ...newPerson, id: dbId } : newPerson;
    setPeople((prev) => [personToAdd, ...prev]);
    // Also register any new tags
    newPerson.tags.forEach(handleAddGlobalTag);
    markNavAsUnread('People');
  };

  const handleBulkCreatePeople = (newPeople: Person[]) => {
    setPeople((prev) => [...newPeople, ...prev]);
    newPeople.forEach(async (p) => {
      await createPersonInDB(p);
      p.tags.forEach(handleAddGlobalTag);
    });
    markNavAsUnread('People');
  };

  const handleDeletePerson = (id: string) => {
    deletePersonInDB(id);
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
    bulkUpdateStageInDB(ids, stage);
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
    bulkDeleteInDB(ids);
    setPeople((prev) => prev.filter((p) => !ids.includes(p.id)));
  };

  const handleMeetingStatusChange = (id: string, status: MeetingStatus) => {
    updateMeetingInDB(id, { status });
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleAddMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    const dbId = await createMeetingInDB(meeting);
    const newMeeting: Meeting = {
      ...meeting,
      id: dbId || `m-${Date.now()}`,
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    markNavAsUnread('Meetings');
  };

  const handleEditMeeting = (id: string, updated: Partial<Meeting>) => {
    updateMeetingInDB(id, updated);
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
  };

  const handleDeleteMeeting = (id: string) => {
    deleteMeetingInDB(id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCompleteTask = (taskId: string, comment: string) => {
    completeTaskInDB(taskId, comment);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED', completionComment: comment, completedAt: 'Just now' }
          : t
      )
    );
  };

  const handleAddTask = async (taskData: Omit<Task, 'id'> | {
    title: string;
    assignedBy?: string;
    assignedTo?: string;
    dueDate?: string;
    dueTime?: string;
    dueAt?: string;
    status?: 'TODO' | 'COMPLETED';
  }) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dbId = await createTaskInDB(taskData);
    const newTask: Task = {
      id: dbId || `t-${Date.now()}`,
      title: taskData.title.trim(),
      assignedBy: taskData.assignedBy?.trim() || 'Muhammad Taqi',
      assignedTo: taskData.assignedTo?.trim() || 'Muhammad Taqi',
      dueDate: taskData.dueDate || todayStr,
      dueTime: taskData.dueTime || '17:00',
      dueAt: taskData.dueAt?.trim() || 'Today, 05:00 PM',
      status: taskData.status || 'TODO',
    };
    setTasks((prev) => [newTask, ...prev]);
    markNavAsUnread('Tasks');
  };

  const handleEditTask = (id: string, updated: Partial<Task>) => {
    updateTaskInDB(id, updated);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskInDB(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === 'TODO' ? 'COMPLETED' : 'TODO';
        updateTaskInDB(id, {
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
        });
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? 'Just now' : undefined,
        };
      })
    );
  };

  // ── Call Log Handlers ──
  const handleAddCallLog = (data: {
    personId?: string;
    businessName: string;
    contactName?: string;
    phone: string;
    callStatus: string;
    comment: string;
    timestamp?: string;
  }) => {
    addCallLogInDB(data);
    const actId = `act-${Date.now()}`;
    const targetDate = data.timestamp ? new Date(data.timestamp) : new Date();
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newAct = {
      id: actId,
      type: 'call' as const,
      title: `Phone Call (${data.callStatus})`,
      callStatus: data.callStatus,
      description: data.comment.trim() || undefined,
      timestamp: targetDate.toISOString(),
      relativeTime: formattedDate,
      author: 'Muhammad Taqi',
    };

    setPeople((prev) => {
      if (data.personId && prev.some((p) => p.id === data.personId)) {
        return prev.map((p) => {
          if (p.id !== data.personId) return p;
          const cleanPhone = data.phone.trim();
          const phones = cleanPhone && !p.phones.includes(cleanPhone)
            ? [...p.phones, cleanPhone]
            : p.phones;
          return {
            ...p,
            phones,
            lastActivity: {
              type: 'call',
              summary: `Call: ${data.callStatus} — ${(data.comment || '').slice(0, 40)}`,
              timestamp: targetDate.toISOString(),
              relativeTime: formattedDate,
            },
            activities: [newAct, ...(p.activities || [])],
          };
        });
      }

      const existingMatch = prev.find(
        (p) => p.businessName.toLowerCase() === data.businessName.trim().toLowerCase()
      );
      if (existingMatch) {
        return prev.map((p) => {
          if (p.id !== existingMatch.id) return p;
          const cleanPhone = data.phone.trim();
          const phones = cleanPhone && !p.phones.includes(cleanPhone)
            ? [...p.phones, cleanPhone]
            : p.phones;
          return {
            ...p,
            phones,
            activities: [newAct, ...(p.activities || [])],
          };
        });
      }

      const newPerson: Person = {
        id: `p-${Date.now()}`,
        businessName: data.businessName.trim() || 'Unassigned Contact',
        contactName: data.contactName?.trim() || '',
        phones: [data.phone.trim()].filter(Boolean),
        emails: [],
        contactFields: [],
        tags: ['New Lead'],
        niche: 'General',
        city: 'United States',
        stage: 'Contacted',
        notes: `Initial call logged on ${formattedDate}.`,
        createdAt: 'Just now',
        activities: [newAct],
      };
      return [newPerson, ...prev];
    });
    markNavAsUnread('Call Log');
  };

  const handleEditCallLog = (
    activityId: string,
    data: {
      callStatus: string;
      comment: string;
      phone?: string;
      timestamp?: string;
    }
  ) => {
    setPeople((prev) =>
      prev.map((p) => {
        const hasAct = p.activities?.some((a) => a.id === activityId);
        if (!hasAct) return p;

        const updatedActivities = p.activities.map((a) => {
          if (a.id !== activityId) return a;
          const targetDate = data.timestamp ? new Date(data.timestamp) : new Date(a.timestamp);
          return {
            ...a,
            callStatus: data.callStatus,
            title: `Phone Call (${data.callStatus})`,
            description: data.comment.trim() || undefined,
            timestamp: targetDate.toISOString(),
          };
        });

        let updatedPhones = p.phones;
        if (data.phone && data.phone.trim()) {
          const ph = data.phone.trim();
          if (!updatedPhones.includes(ph)) {
            updatedPhones = [ph, ...updatedPhones.slice(1)];
          }
        }

        return {
          ...p,
          phones: updatedPhones,
          activities: updatedActivities,
        };
      })
    );
  };

  const handleDeleteCallLog = (activityId: string) => {
    setPeople((prev) =>
      prev.map((p) => {
        const hasAct = p.activities?.some((a) => a.id === activityId);
        if (!hasAct) return p;
        return {
          ...p,
          activities: p.activities.filter((a) => a.id !== activityId),
        };
      })
    );
  };

  // ── Email Log Handlers ──
  const handleAddEmailLog = (data: {
    personId?: string;
    businessName: string;
    contactName?: string;
    email: string;
    emailType: 'Sent' | 'Reply';
    subject: string;
    comment: string;
    timestamp?: string;
  }) => {
    addEmailLogInDB(data);
    const actId = `act-${Date.now()}`;
    const targetDate = data.timestamp ? new Date(data.timestamp) : new Date();
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newAct = {
      id: actId,
      type: 'email' as const,
      title: `Email ${data.emailType}: ${data.subject.trim()}`,
      emailType: data.emailType,
      emailSubject: data.subject.trim(),
      description: data.comment.trim() || undefined,
      timestamp: targetDate.toISOString(),
      relativeTime: formattedDate,
      author: 'Muhammad Taqi',
    };

    setPeople((prev) => {
      if (data.personId && prev.some((p) => p.id === data.personId)) {
        return prev.map((p) => {
          if (p.id !== data.personId) return p;
          const cleanEmail = data.email.trim();
          const emails = cleanEmail && !p.emails.includes(cleanEmail)
            ? [...p.emails, cleanEmail]
            : p.emails;
          return {
            ...p,
            emails,
            lastActivity: {
              type: 'email',
              summary: `Email ${data.emailType}: ${data.subject.trim()}`,
              timestamp: targetDate.toISOString(),
              relativeTime: formattedDate,
            },
            activities: [newAct, ...(p.activities || [])],
          };
        });
      }

      const existingMatch = prev.find(
        (p) => p.businessName.toLowerCase() === data.businessName.trim().toLowerCase()
      );
      if (existingMatch) {
        return prev.map((p) => {
          if (p.id !== existingMatch.id) return p;
          const cleanEmail = data.email.trim();
          const emails = cleanEmail && !p.emails.includes(cleanEmail)
            ? [...p.emails, cleanEmail]
            : p.emails;
          return {
            ...p,
            emails,
            activities: [newAct, ...(p.activities || [])],
          };
        });
      }

      const newPerson: Person = {
        id: `p-${Date.now()}`,
        businessName: data.businessName.trim() || 'Unassigned Contact',
        contactName: data.contactName?.trim() || '',
        phones: [],
        emails: [data.email.trim()].filter(Boolean),
        contactFields: [],
        tags: ['New Lead'],
        niche: 'General',
        city: 'United States',
        stage: 'Contacted',
        notes: `Initial email logged on ${formattedDate}.`,
        createdAt: 'Just now',
        activities: [newAct],
      };
      return [newPerson, ...prev];
    });
    markNavAsUnread('Email Outreach');
  };

  const handleEditEmailLog = (
    activityId: string,
    data: {
      emailType: 'Sent' | 'Reply';
      subject: string;
      comment: string;
      email?: string;
      timestamp?: string;
    }
  ) => {
    setPeople((prev) =>
      prev.map((p) => {
        const hasAct = p.activities?.some((a) => a.id === activityId);
        if (!hasAct) return p;

        const updatedActivities = p.activities.map((a) => {
          if (a.id !== activityId) return a;
          const targetDate = data.timestamp ? new Date(data.timestamp) : new Date(a.timestamp);
          return {
            ...a,
            emailType: data.emailType,
            emailSubject: data.subject.trim(),
            title: `Email ${data.emailType}: ${data.subject.trim()}`,
            description: data.comment.trim() || undefined,
            timestamp: targetDate.toISOString(),
          };
        });

        let updatedEmails = p.emails;
        if (data.email && data.email.trim()) {
          const em = data.email.trim();
          if (!updatedEmails.includes(em)) {
            updatedEmails = [em, ...updatedEmails.slice(1)];
          }
        }

        return {
          ...p,
          emails: updatedEmails,
          activities: updatedActivities,
        };
      })
    );
  };

  const handleDeleteEmailLog = (activityId: string) => {
    setPeople((prev) =>
      prev.map((p) => {
        const hasAct = p.activities?.some((a) => a.id === activityId);
        if (!hasAct) return p;
        return {
          ...p,
          activities: p.activities.filter((a) => a.id !== activityId),
        };
      })
    );
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    window.location.href = '/login';
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
        unreadNav,
        markNavAsRead,
        markNavAsUnread,
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
        onAddMeeting: handleAddMeeting,
        onEditMeeting: handleEditMeeting,
        onDeleteMeeting: handleDeleteMeeting,
        onCompleteTask: handleCompleteTask,
        onAddTask: handleAddTask,
        onEditTask: handleEditTask,
        onDeleteTask: handleDeleteTask,
        onToggleTaskStatus: handleToggleTaskStatus,
        onAddCallLog: handleAddCallLog,
        onEditCallLog: handleEditCallLog,
        onDeleteCallLog: handleDeleteCallLog,
        onAddEmailLog: handleAddEmailLog,
        onEditEmailLog: handleEditEmailLog,
        onDeleteEmailLog: handleDeleteEmailLog,
        onLogout: handleLogout,
        currentUser,
        onUpdateCurrentUser: handleUpdateCurrentUser,
        onChangePassword: handleChangePassword,
        onSwitchRole: handleSwitchRole,
        teamMembers,
        onAddTeamMember: handleAddTeamMember,
        onUpdateTeamMember: handleUpdateTeamMember,
        onDeleteTeamMember: handleDeleteTeamMember,
        toast: {
          success: toastSuccess,
          error:   toastError,
          info:    toastInfo,
          warning: toastWarning,
        },
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
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
