export type LeadStage =
  | 'New'
  | 'Lead'
  | 'Contacted'
  | 'Qualified'
  | 'Hot Prospect'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Past Client'
  | 'Trash';

export type LeadPriority = 'Low' | 'Medium' | 'High';

export type LeadSource =
  | 'Cold Call'
  | 'Email Campaign'
  | 'Referral'
  | 'LinkedIn'
  | 'Website'
  | 'Trade Show'
  | 'Meta Ads'
  | 'Zillow'
  | 'Other';

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email: string;
  stage: LeadStage;
  priority: LeadPriority;
  source: LeadSource | string;
  dealValue: number;        // USD
  assignedTo: string;
  location: string;
  notes: string;
  createdAt: string;        // e.g. "Oct 14, 2026"
  lastContacted?: string;    // e.g. "Oct 20, 2026"
  tags?: string[];
  lastActivity?: {
    type: 'call' | 'email' | 'text' | 'note';
    summary: string;
    timestamp: string;
    relativeTime: string;
  };
}

export const LEAD_STAGES: LeadStage[] = [
  'New',
  'Lead',
  'Contacted',
  'Qualified',
  'Hot Prospect',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
  'Past Client',
  'Trash',
];

export const LEAD_PRIORITIES: LeadPriority[] = ['Low', 'Medium', 'High'];

export const LEAD_SOURCES: LeadSource[] = [
  'Cold Call',
  'Email Campaign',
  'Referral',
  'LinkedIn',
  'Website',
  'Trade Show',
  'Other',
];
