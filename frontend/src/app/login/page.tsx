'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Monitor, Lock, Mail, Sun, Moon, Languages, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          throw new Error(t('login.invalid'));
        }
        throw new Error(data.message || t('login.invalid'));
      }

      router.push('/');
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError(t('login.networkError'));
      } else {
        setError(err instanceof Error ? err.message : t('login.errorUnknown'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--bg)] via-[var(--surface)] to-[var(--bg)] p-4">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
          title={theme === 'dark' ? t('nav.light') : t('nav.dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex h-9 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[var(--muted)] hover:text-[var(--text)]"
            title={t('nav.language')}
          >
            <Languages className="h-4 w-4" />
            <span className="text-xs uppercase">{lang}</span>
            <ChevronDown className="h-3 w-3" />
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
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
            <Monitor className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t('common.appName')}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="label">{t('login.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="email"
                className="input pl-10"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">{t('login.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="password"
                className="input pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              {t('login.forgotPasswordLink')}
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('login.submitLoading') : t('login.submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          {t('login.footer')}
        </p>
        <p className="mb-4 text-center text-xs text-[var(--muted)]">
          &copy; 2024 MG Support Tech. {t('common.appName')}
        </p>
      </div>
    </div>
  );
}
