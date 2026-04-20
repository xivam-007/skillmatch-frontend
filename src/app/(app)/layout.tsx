import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}
