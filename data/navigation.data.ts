import {
  UsersIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

export interface NavItem {
  name: string;
  icon: React.ElementType;
  count?: number;
}

export const STATIC_NAV_ITEMS: Omit<NavItem, 'count'>[] = [
  { name: 'Dashboard', icon: ChartBarIcon },
  { name: 'Leads', icon: UsersIcon },
  { name: 'Call Log', icon: PhoneIcon },
  { name: 'Tasks', icon: CheckCircleIcon },
  { name: 'Meetings', icon: CalendarIcon },
  { name: 'Email Outreach', icon: EnvelopeIcon },
  { name: 'Imports', icon: ArrowUpTrayIcon },
  { name: 'Settings', icon: Cog6ToothIcon },
];
