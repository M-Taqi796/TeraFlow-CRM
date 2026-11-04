import { ProfileView } from '@/components/profile/ProfileView';

export const metadata = {
  title: 'Profile Settings | TeraFlow CRM',
  description: 'Manage personal profile, role permissions, and security credentials.',
};

export const instant = false;

export default function ProfilePage() {
  return <ProfileView />;
}
