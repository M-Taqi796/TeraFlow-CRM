export type PersonStage =
  | 'Lead'
  | 'Contacted'
  | 'Qualified'
  | 'Hot Prospect'
  | 'Negotiation'
  | 'Past Client'
  | 'Trash';

export type PersonPriority = 'Low' | 'Medium' | 'High';

export type ActivityType = 'call' | 'email' | 'text' | 'note' | 'stage_change' | 'tag_added';

export interface PersonActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  relativeTime: string;
  author: string;
}

export interface LastActivity {
  type: 'call' | 'email' | 'text' | 'note';
  summary: string;
  timestamp: string;
  relativeTime: string;
}

export interface Person {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  contactName: string;
  phone: string;
  email: string;
  stage: PersonStage;
  priority: PersonPriority;
  tags: string[];
  source: string;
  dealValue: number; // Estimated value / budget in USD
  assignedTo: string;
  location: string;
  notes: string;
  createdAt: string;
  lastActivity: LastActivity;
  activities: PersonActivity[];
}

export type SmartListId =
  | 'all'
  | 'new_leads'
  | 'recently_active'
  | 'hot_prospects'
  | 'nurture'
  | 'unassigned';

export interface SmartListDef {
  id: SmartListId;
  label: string;
  description: string;
}

export const SMART_LISTS: SmartListDef[] = [
  { id: 'all', label: 'All People', description: 'Complete database view' },
  { id: 'new_leads', label: 'New Leads', description: 'Fresh unworked contacts (< 7 days)' },
  { id: 'recently_active', label: 'Recently Active', description: 'Activity in the last 48 hours' },
  { id: 'hot_prospects', label: 'Hot Prospects', description: 'High-priority & near close deals' },
  { id: 'nurture', label: 'Nurture / Follow-Up', description: 'No communication in > 14 days' },
  { id: 'unassigned', label: 'Pond / Unassigned', description: 'Shared pool of unassigned contacts' },
];

export const PERSON_STAGES: PersonStage[] = [
  'Lead',
  'Contacted',
  'Qualified',
  'Hot Prospect',
  'Negotiation',
  'Past Client',
  'Trash',
];

export const COMMON_FUB_TAGS = [
  'VIP',
  'Buyer',
  'Seller',
  'Investor',
  'High Intent',
  'Website Lead',
  'Meta Ads',
  'Google Ads',
  'Cold Lead',
  'Referral',
  'Open House',
  'Relocation',
  'Pre-Approved',
];
