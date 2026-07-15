'use client';

import { AppShell } from '@/components/AppShell';
import { KanbanBoard } from '@/components/KanbanBoard';

export default function TecnicoDashboard() {
  return (
    <AppShell role="tecnico" title="Panel Técnico" subtitle="Tablero Kanban en tiempo real">
      <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
        Arrastra las tarjetas entre columnas para actualizar el estado. Los cambios se sincronizan en tiempo real.
      </div>
      <KanbanBoard role="tecnico" allowDrag />
    </AppShell>
  );
}
