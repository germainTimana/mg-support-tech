'use client';

import { AppShell } from '@/components/AppShell';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useTranslation } from '@/i18n/I18nProvider';

export default function TecnicoDashboard() {
  const { t } = useTranslation();
  return (
    <AppShell role="tecnico" title={t('tecnico.title')} subtitle={t('tecnico.subtitle')}>
      <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
        {t('tecnico.info')}
      </div>
      <KanbanBoard role="tecnico" allowDrag />
    </AppShell>
  );
}
