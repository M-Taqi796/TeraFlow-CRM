import type { Metadata } from 'next';
import { CRMProvider } from '@/context/CRMContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'TeraFlow CRM',
  description: 'Intelligent real-time CRM and client management system.',
};

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <CRMProvider>
      <AppShell>{children}</AppShell>
    </CRMProvider>
  );
}
