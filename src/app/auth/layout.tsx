import { ReactNode } from 'react';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4 dark:from-[#0f1117] dark:via-[#0f1117] dark:to-[#1a1d27]">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-[var(--text)]">SkillMatch</span>
      </Link>

      {/* Card */}
      <div className="card w-full max-w-md p-8 shadow-xl">{children}</div>

      <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
        Match developers by what you know and what you want to learn.
      </p>
    </div>
  );
}
