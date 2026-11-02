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

export interface NavItemDef {
  name: string;
  href: string;
  icon: React.ElementType;
  count?: number;
}

export const STATIC_NAV_ITEMS: Omit<NavItemDef, 'count'>[] = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'People', href: '/people', icon: UsersIcon },
  { name: 'Call Log', href: '/calls', icon: PhoneIcon },
  { name: 'Email Outreach', href: '/outreach', icon: EnvelopeIcon },
  { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
  { name: 'Meetings', href: '/meetings', icon: CalendarIcon },
  { name: 'Imports', href: '/imports', icon: ArrowUpTrayIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];
