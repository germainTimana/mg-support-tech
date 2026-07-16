'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { KANBAN_COLUMNS, type Servicio, type ServiceStatus, type UserRole } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailModal } from './ServiceDetailModal';

interface KanbanBoardProps {
  readOnly?: boolean;
  allowDrag?: boolean;
  role: UserRole;
  onPay?: (servicio: Servicio) => void;
}

type BoardData = Record<ServiceStatus, Servicio[]>;

const emptyBoard = (): BoardData => ({
  pendiente: [],
  en_reparacion: [],
  listo: [],
  entregado: [],
});

export function KanbanBoard({ readOnly, allowDrag = true, role, onPay }: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardData>(emptyBoard());
  const [active, setActive] = useState<Servicio | null>(null);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/servicios/kanban');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBoard({ ...emptyBoard(), ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tablero');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    let socket: Socket | null = null;

    async function connect() {
      const tokenRes = await fetch('/api/auth/token').catch(() => null);
      const tokenData = tokenRes?.ok ? await tokenRes.json() : null;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

      socket = io(`${wsUrl}/kanban`, {
        auth: { token: tokenData?.token },
        transports: ['websocket'],
      });

      socket.on('servicio:updated', (servicio: Servicio) => {
        setBoard((prev) => {
          const next = emptyBoard();
          const all = [
            ...prev.pendiente,
            ...prev.en_reparacion,
            ...prev.listo,
            ...prev.entregado,
          ].filter((s) => s._id !== servicio._id);
          all.push(servicio);
          for (const s of all) {
            next[s.estado]?.push(s);
          }
          return next;
        });
        setSelected((cur) => (cur?._id === servicio._id ? servicio : cur));
      });
    }

    connect();
    return () => {
      socket?.disconnect();
    };
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    setActive(null);
    if (readOnly || !allowDrag) return;

    const { active: dragItem, over } = event;
    if (!over) return;

    const servicioId = dragItem.id as string;
    const newEstado = over.id as ServiceStatus;
    const servicio = [
      ...board.pendiente,
      ...board.en_reparacion,
      ...board.listo,
      ...board.entregado,
    ].find((s) => s._id === servicioId);

    if (!servicio || servicio.estado === newEstado) return;

    try {
      const res = await fetch(`/api/servicios/${servicioId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al mover servicio');
      loadBoard();
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const servicio = [
      ...board.pendiente,
      ...board.en_reparacion,
      ...board.listo,
      ...board.entregado,
    ].find((s) => s._id === id);
    setActive(servicio || null);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--muted)]">
        Cargando tablero...
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
          <button className="ml-2 underline" onClick={() => setError('')}>
            Cerrar
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              servicios={board[col.id] || []}
              onSelect={setSelected}
              draggable={!readOnly && allowDrag && role !== 'cliente'}
            />
          ))}
        </div>
        <DragOverlay>
          {active ? (
            <div className="rotate-2 opacity-90">
              <ServiceCard servicio={active} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selected && (
        <ServiceDetailModal
          servicio={selected}
          role={role}
          onClose={() => setSelected(null)}
          onUpdated={(s) => {
            setSelected(s);
            loadBoard();
          }}
          onPay={onPay}
        />
      )}
    </>
  );
}
