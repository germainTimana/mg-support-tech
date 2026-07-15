'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Servicio, ServiceStatus } from '@/lib/types';
import { ServiceCard } from './ServiceCard';

interface KanbanColumnProps {
  column: { id: ServiceStatus; label: string; color: string };
  servicios: Servicio[];
  onSelect: (s: Servicio) => void;
  draggable: boolean;
}

export function KanbanColumn({ column, servicios, onSelect, draggable }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] flex-col rounded-xl border-2 p-3 transition-colors ${column.color} ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-white">{column.label}</h3>
        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{servicios.length}</span>
      </div>
      <SortableContext items={servicios.map((s) => s._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {servicios.map((s) => (
            <ServiceCard
              key={s._id}
              servicio={s}
              onClick={() => onSelect(s)}
              draggable={draggable}
            />
          ))}
          {servicios.length === 0 && (
            <p className="py-8 text-center text-xs text-[var(--muted)]">Sin servicios</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
