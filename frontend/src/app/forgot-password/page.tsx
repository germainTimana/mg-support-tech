'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Monitor, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/I18nProvider';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t('forgot.errorGeneric'));
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forgot.errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--bg)] via-[var(--surface)] to-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
            <Monitor className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t('forgot.title')}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t('forgot.subtitle')}
          </p>
        </div>

        {success ? (
          <div className="card space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-[var(--text)]">{t('forgot.successMessage')}</p>
            <p className="text-xs text-[var(--muted)]">{t('forgot.successHint')}</p>
            <Link href="/login" className="btn-primary inline-block text-center">
              {t('login.backToLogin')}
            </Link>
          </div>
        ) : (
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

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('forgot.sending') : t('forgot.submit')}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('login.backToLogin')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
