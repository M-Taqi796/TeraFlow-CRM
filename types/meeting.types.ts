export type MeetingStatus =
  | 'Scheduled'
  | 'Not attended'
  | 'Deal Done'
  | 'Deal Denied'
  | 'Other';

export interface Meeting {
  id: string;
  businessName: string;
  clientName: string;
  phone: string;
  email: string;
  ourTime: string;
  theirTime: string;
  status: MeetingStatus;
}

export const STATUS_OPTIONS: MeetingStatus[] = [
  'Scheduled',
  'Not attended',
  'Deal Done',
  'Deal Denied',
  'Other',
];
