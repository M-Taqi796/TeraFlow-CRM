import { supabase } from '@/lib/supabase';
import type { Person, PersonStage, PersonActivity } from '@/types/person.types';
import type { Meeting, MeetingStatus } from '@/types/meeting.types';
import type { Task } from '@/types/task.types';

export const DEFAULT_ORG_ID = 'c74f1503-9d09-4ffc-bf08-aa7f09f12f43';
export const DEFAULT_USER_ID = 'a0000000-0000-0000-0000-000000000001';

// ── Mapping Helpers ──

function mapRowToPerson(row: any, activities: any[] = []): Person {
  const contactActivities = activities
    .filter((a) => a.contact_id === row.id || (row.business_name && a.business_name === row.business_name))
    .map((a): PersonActivity => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description || undefined,
      callStatus: a.call_status || undefined,
      emailType: a.email_type || undefined,
      emailSubject: a.email_subject || undefined,
      timestamp: a.created_at,
      relativeTime: formatRelativeTime(a.created_at),
      author: a.author_name || 'Muhammad Taqi',
    }));

  return {
    id: row.id,
    businessName: row.business_name || '',
    contactName: row.contact_name || '',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    phones: Array.isArray(row.phones) ? row.phones : [],
    emails: Array.isArray(row.emails) ? row.emails : [],
    contactFields: Array.isArray(row.contact_fields) ? row.contact_fields : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    niche: row.niche || 'General',
    city: row.city || 'United States',
    stage: row.stage || 'New Leads',
    notes: row.notes || '',
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    lastActivity: row.last_activity_type ? {
      type: row.last_activity_type,
      summary: row.last_activity_summary || '',
      timestamp: row.last_contacted_at || row.created_at,
      relativeTime: formatRelativeTime(row.last_contacted_at || row.created_at),
    } : undefined,
    activities: contactActivities,
  };
}

function mapRowToMeeting(row: any): Meeting {
  return {
    id: row.id,
    businessName: row.business_name || '',
    clientName: row.client_name || '',
    phone: row.phone || '',
    email: row.email || '',
    date: row.meeting_date || '',
    ourTime: row.our_time || '',
    theirTime: row.their_time || '',
    status: row.status || 'Scheduled',
  };
}

function mapRowToTask(row: any): Task {
  const dueAtDisplay = row.due_date && row.due_time
    ? `${row.due_date} · ${row.due_time}`
    : 'Today, 05:00 PM';

  return {
    id: row.id,
    title: row.title || '',
    assignedBy: row.assigned_by_name || 'Muhammad Taqi',
    assignedTo: row.assigned_to_name || 'Muhammad Taqi',
    dueDate: row.due_date || new Date().toISOString().slice(0, 10),
    dueTime: row.due_time || '17:00',
    dueAt: dueAtDisplay,
    status: row.status || 'TODO',
    completionComment: row.completion_comment || undefined,
    completedAt: row.completed_at ? formatRelativeTime(row.completed_at) : undefined,
  };
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Recently';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

// ── Read APIs ──

export async function fetchPeopleFromDB(): Promise<Person[]> {
  try {
    const [contactsRes, activitiesRes] = await Promise.all([
      supabase
        .from('contacts')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (contactsRes.error) {
      console.error('Error fetching contacts:', contactsRes.error.message);
      return [];
    }

    const activities = activitiesRes.data || [];
    return (contactsRes.data || []).map((row) => mapRowToPerson(row, activities));
  } catch (err: any) {
    console.error('fetchPeopleFromDB error:', err.message);
    return [];
  }
}

export async function fetchMeetingsFromDB(): Promise<Meeting[]> {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .is('deleted_at', null)
      .order('meeting_date', { ascending: true });

    if (error) {
      console.error('Error fetching meetings:', error.message);
      return [];
    }

    return (data || []).map(mapRowToMeeting);
  } catch (err: any) {
    console.error('fetchMeetingsFromDB error:', err.message);
    return [];
  }
}

export async function fetchTasksFromDB(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error.message);
      return [];
    }

    return (data || []).map(mapRowToTask);
  } catch (err: any) {
    console.error('fetchTasksFromDB error:', err.message);
    return [];
  }
}

export async function fetchCatalogsFromDB(): Promise<{
  customNiches: string[];
  customCities: string[];
  globalTags: string[];
}> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('custom_niches, custom_cities, global_tags')
      .eq('id', DEFAULT_ORG_ID)
      .single();

    if (error || !data) {
      return { customNiches: [], customCities: [], globalTags: [] };
    }

    return {
      customNiches: data.custom_niches || [],
      customCities: data.custom_cities || [],
      globalTags: data.global_tags || [],
    };
  } catch {
    return { customNiches: [], customCities: [], globalTags: [] };
  }
}

// ── Contact / People Mutations ──

export async function createPersonInDB(person: Person): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        org_id: DEFAULT_ORG_ID,
        business_name: person.businessName,
        contact_name: person.contactName || '',
        first_name: person.firstName || '',
        last_name: person.lastName || '',
        primary_phone: person.phones[0] || null,
        primary_email: person.emails[0] || null,
        phones: person.phones || [],
        emails: person.emails || [],
        contact_fields: person.contactFields || [],
        tags: person.tags || [],
        niche: person.niche || 'General',
        city: person.city || 'United States',
        stage: person.stage || 'New Leads',
        notes: person.notes || '',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (err: any) {
    console.error('createPersonInDB failed:', err.message);
    return null;
  }
}

export async function updatePersonInDB(person: Person): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({
        business_name: person.businessName,
        contact_name: person.contactName || '',
        first_name: person.firstName || '',
        last_name: person.lastName || '',
        primary_phone: person.phones[0] || null,
        primary_email: person.emails[0] || null,
        phones: person.phones || [],
        emails: person.emails || [],
        contact_fields: person.contactFields || [],
        tags: person.tags || [],
        niche: person.niche || 'General',
        city: person.city || 'United States',
        stage: person.stage,
        notes: person.notes || '',
      })
      .eq('id', person.id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('updatePersonInDB failed:', err.message);
    return false;
  }
}

export async function updatePersonStageInDB(id: string, stage: PersonStage): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({
        stage,
        last_activity_type: 'stage_change',
        last_activity_summary: `Stage updated to ${stage}`,
        last_contacted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // Also record activity
    await supabase.from('activities').insert({
      org_id: DEFAULT_ORG_ID,
      contact_id: id,
      author_id: DEFAULT_USER_ID,
      author_name: 'Muhammad Taqi',
      type: 'stage_change',
      title: 'Stage Changed',
      description: `Stage moved to ${stage}`,
      business_name: 'Contact',
    });

    return true;
  } catch (err: any) {
    console.error('updatePersonStageInDB failed:', err.message);
    return false;
  }
}

export async function deletePersonInDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('deletePersonInDB failed:', err.message);
    return false;
  }
}

export async function bulkUpdateStageInDB(ids: string[], stage: PersonStage): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({ stage })
      .in('id', ids);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('bulkUpdateStageInDB failed:', err.message);
    return false;
  }
}

export async function bulkDeleteInDB(ids: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('bulkDeleteInDB failed:', err.message);
    return false;
  }
}

// ── Meeting Mutations ──

export async function createMeetingInDB(meeting: Omit<Meeting, 'id'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        org_id: DEFAULT_ORG_ID,
        created_by: DEFAULT_USER_ID,
        business_name: meeting.businessName,
        client_name: meeting.clientName,
        phone: meeting.phone,
        email: meeting.email,
        meeting_date: meeting.date || new Date().toISOString().slice(0, 10),
        our_time: meeting.ourTime,
        their_time: meeting.theirTime,
        status: meeting.status || 'Scheduled',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (err: any) {
    console.error('createMeetingInDB failed:', err.message);
    return null;
  }
}

export async function updateMeetingInDB(id: string, meeting: Partial<Meeting>): Promise<boolean> {
  try {
    const payload: any = {};
    if (meeting.businessName !== undefined) payload.business_name = meeting.businessName;
    if (meeting.clientName !== undefined) payload.client_name = meeting.clientName;
    if (meeting.phone !== undefined) payload.phone = meeting.phone;
    if (meeting.email !== undefined) payload.email = meeting.email;
    if (meeting.date !== undefined) payload.meeting_date = meeting.date;
    if (meeting.ourTime !== undefined) payload.our_time = meeting.ourTime;
    if (meeting.theirTime !== undefined) payload.their_time = meeting.theirTime;
    if (meeting.status !== undefined) payload.status = meeting.status;

    const { error } = await supabase
      .from('meetings')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('updateMeetingInDB failed:', err.message);
    return false;
  }
}

export async function deleteMeetingInDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('meetings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('deleteMeetingInDB failed:', err.message);
    return false;
  }
}

// ── Task Mutations ──

export async function createTaskInDB(taskData: {
  title: string;
  assignedBy?: string;
  assignedTo?: string;
  dueDate?: string;
  dueTime?: string;
  status?: 'TODO' | 'COMPLETED';
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        org_id: DEFAULT_ORG_ID,
        assigned_by: DEFAULT_USER_ID,
        assigned_to: DEFAULT_USER_ID,
        assigned_by_name: taskData.assignedBy || 'Muhammad Taqi',
        assigned_to_name: taskData.assignedTo || 'Muhammad Taqi',
        title: taskData.title,
        due_date: taskData.dueDate || new Date().toISOString().slice(0, 10),
        due_time: taskData.dueTime || '17:00',
        due_at: new Date().toISOString(),
        status: taskData.status || 'TODO',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (err: any) {
    console.error('createTaskInDB failed:', err.message);
    return null;
  }
}

export async function updateTaskInDB(id: string, task: Partial<Task>): Promise<boolean> {
  try {
    const payload: any = {};
    if (task.title !== undefined) payload.title = task.title;
    if (task.status !== undefined) payload.status = task.status;
    if (task.dueDate !== undefined) payload.due_date = task.dueDate;
    if (task.dueTime !== undefined) payload.due_time = task.dueTime;
    if (task.assignedTo !== undefined) payload.assigned_to_name = task.assignedTo;
    if (task.completionComment !== undefined) payload.completion_comment = task.completionComment;
    if (task.completedAt !== undefined) payload.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('updateTaskInDB failed:', err.message);
    return false;
  }
}

export async function completeTaskInDB(id: string, comment: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'COMPLETED',
        completion_comment: comment,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('completeTaskInDB failed:', err.message);
    return false;
  }
}

export async function deleteTaskInDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('deleteTaskInDB failed:', err.message);
    return false;
  }
}

// ── Call & Email Activities ──

export async function addCallLogInDB(data: {
  personId?: string;
  businessName: string;
  contactName?: string;
  phone: string;
  callStatus: string;
  comment: string;
  timestamp?: string;
}): Promise<string | null> {
  try {
    const createdAt = data.timestamp || new Date().toISOString();

    const { data: act, error } = await supabase
      .from('activities')
      .insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: data.personId || null,
        author_id: DEFAULT_USER_ID,
        author_name: 'Muhammad Taqi',
        type: 'call',
        title: `Phone Call (${data.callStatus})`,
        description: data.comment,
        business_name: data.businessName,
        contact_name: data.contactName || '',
        phone: data.phone,
        call_status: data.callStatus,
        created_at: createdAt,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Update contact denormalized cache if linked
    if (data.personId) {
      await supabase
        .from('contacts')
        .update({
          last_activity_type: 'call',
          last_activity_summary: `Call: ${data.callStatus} — ${(data.comment || '').slice(0, 40)}`,
          last_contacted_at: createdAt,
        })
        .eq('id', data.personId);
    }

    return act?.id || null;
  } catch (err: any) {
    console.error('addCallLogInDB failed:', err.message);
    return null;
  }
}

export async function addEmailLogInDB(data: {
  personId?: string;
  businessName: string;
  contactName?: string;
  email: string;
  emailType: 'Sent' | 'Reply';
  subject: string;
  comment: string;
  timestamp?: string;
}): Promise<string | null> {
  try {
    const createdAt = data.timestamp || new Date().toISOString();

    const { data: act, error } = await supabase
      .from('activities')
      .insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: data.personId || null,
        author_id: DEFAULT_USER_ID,
        author_name: 'Muhammad Taqi',
        type: 'email',
        title: `Email ${data.emailType}: ${data.subject.trim()}`,
        description: data.comment,
        business_name: data.businessName,
        contact_name: data.contactName || '',
        email: data.email,
        email_type: data.emailType,
        email_subject: data.subject.trim(),
        created_at: createdAt,
      })
      .select('id')
      .single();

    if (error) throw error;

    if (data.personId) {
      await supabase
        .from('contacts')
        .update({
          last_activity_type: 'email',
          last_activity_summary: `Email ${data.emailType}: ${data.subject.trim()}`,
          last_contacted_at: createdAt,
        })
        .eq('id', data.personId);
    }

    return act?.id || null;
  } catch (err: any) {
    console.error('addEmailLogInDB failed:', err.message);
    return null;
  }
}

// ── Dynamic Catalog Updates ──

export async function addCatalogItemInDB(
  type: 'niche' | 'city' | 'tag',
  value: string
): Promise<boolean> {
  try {
    const clean = value.trim();
    if (!clean) return false;

    const column =
      type === 'niche'
        ? 'custom_niches'
        : type === 'city'
        ? 'custom_cities'
        : 'global_tags';

    const { data: org } = await supabase
      .from('organizations')
      .select(column)
      .eq('id', DEFAULT_ORG_ID)
      .single();

    if (!org) return false;

    const currentList: string[] = (org as any)[column] || [];
    if (currentList.includes(clean)) return true;

    const updatedList = [...currentList, clean];
    const { error } = await supabase
      .from('organizations')
      .update({ [column]: updatedList })
      .eq('id', DEFAULT_ORG_ID);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('addCatalogItemInDB failed:', err.message);
    return false;
  }
}

// ── Realtime Synchronization ──

export function subscribeToRealtimeChanges(callbacks: {
  onContactsChange?: () => void;
  onMeetingsChange?: () => void;
  onTasksChange?: () => void;
  onActivitiesChange?: () => void;
}) {
  const channel = supabase
    .channel('crm-realtime-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
      callbacks.onContactsChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
      callbacks.onMeetingsChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      callbacks.onTasksChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
      callbacks.onActivitiesChange?.();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
