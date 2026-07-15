'use client';

import { useState } from 'react';
import { X, MessageSquare, CreditCard } from 'lucide-react';
import type { Servicio, ServiceStatus, UserRole } from '@/lib/types';
import { KANBAN_COLUMNS } from '@/lib/types';

interface ServiceDetailModalProps {
  servicio: Servicio;
  role: UserRole;
  onClose: () => void;
  onUpdated: (s: Servicio) => void;
  onPay?: (s: Servicio) => void;
}

export function ServiceDetailModal({
  servicio,
  role,
  onClose,
  onUpdated,
  onPay,
}: ServiceDetailModalProps) {
  const [texto, setTexto] = useState('');
  const [fase, setFase] = useState<ServiceStatus>(servicio.estado);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const equipo = typeof servicio.equipoId === 'object' ? servicio.equipoId : null;

  async function addObservacion() {
    if (!texto.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/servicios/${servicio._id}/observaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, fase }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onUpdated(data);
      setTexto('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  const obsByPhase = KANBAN_COLUMNS.map((col) => ({
    ...col,
    items: servicio.observaciones.filter((o) => o.fase === col.id),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-sm text-blue-400">{servicio.codigoServicio}</p>
            <h2 className="text-xl font-bold">{equipo?.marca} {equipo?.modelo}</h2>
            <p className="text-sm text-[var(--muted)]">{servicio.descripcion}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--surface-hover)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--muted)]">Estado</p>
            <p className="font-medium capitalize">{servicio.estado.replace('_', ' ')}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--muted)]">Costo</p>
            <p className="font-medium text-emerald-400">${servicio.costoEstimado.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--muted)]">Cliente</p>
            <p className="font-medium">{servicio.clienteId?.nombre}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--muted)]">Técnico</p>
            <p className="font-medium">{servicio.tecnicoId?.nombre}</p>
          </div>
        </div>

        {role === 'cliente' && servicio.estado === 'listo' && !servicio.pagado && onPay && (
          <button
            onClick={() => onPay(servicio)}
            className="btn-primary mb-4 w-full"
          >
            <CreditCard className="h-4 w-4" />
            Pagar servicio
          </button>
        )}

        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <MessageSquare className="h-4 w-4" />
          Observaciones por fase
        </h3>

        <div className="space-y-4">
          {obsByPhase.map((phase) => (
            <div key={phase.id} className="rounded-lg border border-[var(--border)] p-3">
              <p className="mb-2 text-sm font-medium">{phase.label}</p>
              {phase.items.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">Sin observaciones</p>
              ) : (
                <ul className="space-y-2">
                  {phase.items.map((o, i) => (
                    <li key={i} className="rounded bg-[var(--bg)] p-2 text-sm">
                      <p>{o.texto}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {typeof o.autorId === 'object' ? o.autorId.nombre : 'Usuario'} ·{' '}
                        {new Date(o.fecha).toLocaleString('es-CO')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="label">Agregar observación</p>
            <select
              className="input mb-2"
              value={fase}
              onChange={(e) => setFase(e.target.value as ServiceStatus)}
            >
              {KANBAN_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <textarea
              className="input mb-2 min-h-[80px]"
              placeholder="Escriba una observación..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
            <button onClick={addObservacion} disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : 'Agregar observación'}
            </button>
          </div>
      </div>
    </div>
  );
}
