import { SettingsView } from '@/components/settings/SettingsView/SettingsView';

export const metadata = {
  title: 'Settings & Preferences | TeraFlow CRM',
  description: 'Manage CRM settings, account security, team permissions, and workspace preferences.',
};

export const instant = false;

export default function SettingsPage() {
  return <SettingsView />;
}
