'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Laptop } from 'lucide-react';
import type { Servicio } from '@/lib/types';
import { useTranslation } from '@/i18n/I18nProvider';

interface ServiceCardProps {
  servicio: Servicio;
  onClick: () => void;
  draggable?: boolean;
}

export function ServiceCard({ servicio, onClick, draggable }: ServiceCardProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: servicio._id,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const equipo = typeof servicio.equipoId === 'object' ? servicio.equipoId : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition hover:border-blue-500/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {draggable && (
          <button
            className="mt-0.5 text-[var(--muted)] hover:text-white"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 shrink-0 text-blue-400" />
            <span className="truncate font-mono text-xs font-semibold text-blue-300">
              {servicio.codigoServicio}
            </span>
          </div>
          {equipo && (
            <p className="mt-1 truncate text-sm text-white">
              {equipo.marca} {equipo.modelo}
            </p>
          )}
          <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{servicio.descripcion}</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[var(--muted)]">
              {typeof servicio.clienteId === 'object' ? servicio.clienteId.nombre : t('service.fallbackClient')}
            </span>
            <span className="font-medium text-emerald-400">
              ${servicio.costoEstimado.toLocaleString()}
            </span>
          </div>
          {servicio.pagado && (
            <span className="mt-2 inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              {t('service.paid')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
