import { useThemeContext } from '../context/ThemeContext';

interface PlaceholderRouteProps {
  title: string;
  description: string;
}

function PlaceholderRoute({ title, description }: PlaceholderRouteProps) {
  const { theme } = useThemeContext();
  return (
    <div className={`flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-3`}>
      <p className={`text-2xl font-bold ${theme.textMain} fira-sans-bold`}>{title}</p>
      <p className={`text-sm ${theme.textMuted} max-w-xs`}>{description}</p>
    </div>
  );
}

export function LeadsRoute() {
  return <PlaceholderRoute title="Leads" description="Manage and track your leads pipeline here." />;
}

export function CallLogRoute() {
  return <PlaceholderRoute title="Call Log" description="View all call activity and history." />;
}

export function TasksRoute() {
  return <PlaceholderRoute title="Tasks" description="Full task management view coming soon." />;
}

export function MeetingsRoute() {
  return <PlaceholderRoute title="Meetings" description="View all scheduled and past meetings." />;
}

export function EmailOutreachRoute() {
  return <PlaceholderRoute title="Email Outreach" description="Manage your email campaigns and sequences." />;
}

export function ImportsRoute() {
  return <PlaceholderRoute title="Imports" description="Upload and manage lead import batches." />;
}

export function SettingsRoute() {
  return <PlaceholderRoute title="Settings" description="Configure your CRM preferences." />;
}
