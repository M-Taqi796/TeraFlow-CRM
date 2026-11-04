import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CRMProvider } from '@/context/CRMContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'TeraFlow CRM',
  description: 'Intelligent real-time CRM and client management system.',
};

export const instant = false;

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const navCookie = cookieStore.get('teraflow_nav_expanded')?.value;
  const taskbarCookie = cookieStore.get('teraflow_taskbar_expanded')?.value;

  const initialNavExpanded = navCookie !== undefined ? navCookie === 'true' : true;
  const initialTaskbarExpanded = taskbarCookie !== undefined ? taskbarCookie === 'true' : true;

  return (
    <CRMProvider>
      <AppShell
        initialNavExpanded={initialNavExpanded}
        initialTaskbarExpanded={initialTaskbarExpanded}
      >
        {children}
      </AppShell>
    </CRMProvider>
  );
}
