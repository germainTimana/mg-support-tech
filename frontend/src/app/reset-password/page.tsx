'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Monitor, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/I18nProvider';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError(t('reset.invalidLinkMessage'));
    }
  }, [token, email, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('reset.errorMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('reset.errorMismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t('reset.errorGeneric'));
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reset.errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--bg)] via-[var(--surface)] to-[var(--bg)] p-4">
        <div className="card max-w-md w-full space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)]">{t('reset.invalidLinkTitle')}</h1>
          <p className="text-sm text-[var(--muted)]">{t('reset.invalidLinkMessage')}</p>
          <Link href="/forgot-password" className="btn-primary inline-block text-center">
            {t('reset.invalidLinkAction')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--bg)] via-[var(--surface)] to-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
            <Monitor className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t('reset.title')}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{t('reset.subtitle')}</p>
        </div>

        {success ? (
          <div className="card space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-[var(--text)]">{t('reset.successMessage')}</p>
            <p className="text-xs text-[var(--muted)]">{t('reset.successTitle')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="label">{t('reset.newPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder={t('reset.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="label">{t('reset.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder={t('reset.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('reset.submitting') : t('reset.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--bg)] via-[var(--surface)] to-[var(--bg)] p-4">
        <div className="text-[var(--muted)]">Cargando...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
