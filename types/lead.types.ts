export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadPriority = 'Low' | 'Medium' | 'High';

export type LeadSource =
  | 'Cold Call'
  | 'Email Campaign'
  | 'Referral'
  | 'LinkedIn'
  | 'Website'
  | 'Trade Show'
  | 'Other';

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  stage: LeadStage;
  priority: LeadPriority;
  source: LeadSource;
  dealValue: number;        // USD
  assignedTo: string;
  location: string;
  notes: string;
  createdAt: string;        // e.g. "Oct 14, 2026"
  lastContacted: string;    // e.g. "Oct 20, 2026"
}

export const LEAD_STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
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
