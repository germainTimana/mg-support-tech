'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Monitor, LogOut, Sun, Moon, Languages, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/components/ThemeProvider';

interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  title: string;
  subtitle?: string;
}

export function AppShell({ children, role, title, subtitle }: AppShellProps) {
  const router = useRouter();
  const { t, lang, setLang, availableLangs } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <Link href="/" className="font-semibold text-[var(--text)] hover:text-[var(--accent)]">
                {t('common.appName')}
              </Link>
              <p className="text-xs text-[var(--muted)]">{t(`roles.${role}`)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[var(--text)]">{title}</p>
              {subtitle && <p className="text-xs text-[var(--muted)]">{subtitle}</p>}
            </div>

            <button
              onClick={toggleTheme}
              className="btn-secondary p-2 text-sm"
              title={theme === 'dark' ? t('nav.light') : t('nav.dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="btn-secondary p-2 text-sm"
                title={t('nav.language')}
              >
                <Languages className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 hidden sm:inline" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
                  {availableLangs.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        lang === l.code
                          ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                          : 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {lang === l.code && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      )}
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={logout} className="btn-secondary text-sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
