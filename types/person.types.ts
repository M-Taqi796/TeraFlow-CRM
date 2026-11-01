export type PersonStage =
  | 'New Leads'
  | 'Contacted'
  | 'Booked'
  | 'Closed'
  | 'Follow-Up'
  | 'Denied'
  | 'Past Clients';

export type ActivityType =
  | 'call'
  | 'email'
  | 'stage_change'
  | 'tag_added'
  | 'tag_removed'
  | 'note'
  | 'contact_info'
  | 'name_change';

export interface PersonActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  callStatus?: string; // 'Answered' | 'Not answered' | 'Call failed' | 'Busy' | 'Left Voicemail' | 'Wrong Number'
  emailType?: 'Sent' | 'Reply';
  emailSubject?: string;
  timestamp: string; // ISO string
  relativeTime?: string;
  author: string;
}

export interface LastActivity {
  type: 'call' | 'email' | 'note' | 'stage_change';
  summary: string;
  timestamp: string;
  relativeTime: string;
}

export type ContactFieldType =
  | 'phone'
  | 'email'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'website'
  | 'address';

export interface ContactInfoField {
  id: string;
  type: ContactFieldType;
  label: string;
  value: string;
}

export interface Person {
  id: string;
  businessName: string;
  contactName?: string;
  firstName?: string;
  lastName?: string;
  phones: string[];
  emails: string[];
  contactFields: ContactInfoField[];
  tags: string[];
  niche: string; // e.g. "Dentists", "Realtors", "Roofing"
  city: string;  // e.g. "New York", "Chicago", "Miami"
  stage: PersonStage;
  notes: string;
  createdAt: string;
  lastActivity?: LastActivity;
  activities: PersonActivity[];
}

export type SmartListId =
  | 'all'
  | 'new_leads'
  | 'contacted'
  | 'booked'
  | 'closed'
  | 'follow_up'
  | 'denied'
  | 'past_clients';

export interface SmartListDef {
  id: SmartListId;
  label: string;
  description: string;
  stageMatch?: PersonStage;
}

export const SMART_LISTS: SmartListDef[] = [
  { id: 'all',          label: 'All People',   description: 'All contacts in database' },
  { id: 'new_leads',    label: 'New Leads',    description: 'Not contacted once', stageMatch: 'New Leads' },
  { id: 'contacted',    label: 'Contacted',    description: 'Contacted at least once via email or phone', stageMatch: 'Contacted' },
  { id: 'booked',       label: 'Booked',       description: 'Agreed for a meeting', stageMatch: 'Booked' },
  { id: 'closed',       label: 'Closed',       description: 'Agreed to work with us', stageMatch: 'Closed' },
  { id: 'follow_up',    label: 'Follow-Up',    description: 'Asked to call back or follow up later', stageMatch: 'Follow-Up' },
  { id: 'denied',       label: 'Denied',       description: 'Denied to work with us', stageMatch: 'Denied' },
  { id: 'past_clients', label: 'Past Clients', description: 'Past clients and accounts', stageMatch: 'Past Clients' },
];

export const PERSON_STAGES: PersonStage[] = [
  'New Leads',
  'Contacted',
  'Booked',
  'Closed',
  'Follow-Up',
  'Denied',
  'Past Clients',
];

export const DEFAULT_NICHES = [
  'Dentists',
  'Realtors',
  'Roofing',
  'Solar',
  'Lawyers',
  'HVAC',
  'Plumbing',
  'Accounting',
  'Fitness & Gyms',
  'Med Spa',
];

export const DEFAULT_CITIES = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Miami',
  'Austin',
  'Dallas',
  'Phoenix',
  'Atlanta',
  'Denver',
];

export const COMMON_TAGS = [
  'Decision Maker',
  'Gatekeeper Reached',
  'High Priority',
  'Cold Lead',
  'Inbound Lead',
  'Referral',
  'Website Lead',
  'Busy',
  'Call Back Later',
  'Send Info',
];
