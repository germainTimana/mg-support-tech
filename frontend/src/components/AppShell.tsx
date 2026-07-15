'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Monitor, LogOut } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/types';

interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  title: string;
  subtitle?: string;
}

export function AppShell({ children, role, title, subtitle }: AppShellProps) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <Link href="/" className="font-semibold text-white hover:text-blue-400">
                MG Support Tech
              </Link>
              <p className="text-xs text-[var(--muted)]">{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{title}</p>
              {subtitle && <p className="text-xs text-[var(--muted)]">{subtitle}</p>}
            </div>
            <button onClick={logout} className="btn-secondary text-sm">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
