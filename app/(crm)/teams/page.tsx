import { TeamsView } from '@/components/teams/TeamsView';

export const metadata = {
  title: 'Teams & Permissions | TeraFlow CRM',
  description: 'Manage team roster, roles, credentials, and access control.',
};

export const instant = false;

export default function TeamsPage() {
  return <TeamsView />;
}
