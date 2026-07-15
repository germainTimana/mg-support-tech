'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { KanbanBoard } from '@/components/KanbanBoard';
import { PaymentModal } from '@/components/PaymentModal';
import { Search } from 'lucide-react';
import type { Servicio } from '@/lib/types';

export default function ClienteDashboard() {
  const [payServicio, setPayServicio] = useState<Servicio | null>(null);
  const [codigo, setCodigo] = useState('');
  const [consulta, setConsulta] = useState<Servicio | null>(null);
  const [consultaError, setConsultaError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  async function buscarPorCodigo(e: React.FormEvent) {
    e.preventDefault();
    setConsultaError('');
    setConsulta(null);
    try {
      const res = await fetch(`/api/servicios/codigo/${codigo.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setConsulta(data);
    } catch (err) {
      setConsultaError(err instanceof Error ? err.message : 'Servicio no encontrado');
    }
  }

  return (
    <AppShell role="cliente" title="Mis servicios" subtitle="Seguimiento y pagos">
      <form onSubmit={buscarPorCodigo} className="card mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="input pl-10"
            placeholder="Consultar por código (Ej: MGS-ABC12345)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          />
        </div>
        <button type="submit" className="btn-primary sm:w-auto">Consultar</button>
      </form>

      {consultaError && (
        <p className="mb-4 text-sm text-red-400">{consultaError}</p>
      )}

      {consulta && (
        <div className="card mb-6">
          <p className="font-mono text-blue-400">{consulta.codigoServicio}</p>
          <p className="font-medium capitalize">Estado: {consulta.estado.replace('_', ' ')}</p>
          <p className="text-sm text-[var(--muted)]">{consulta.descripcion}</p>
          {consulta.estado === 'listo' && !consulta.pagado && (
            <button onClick={() => setPayServicio(consulta)} className="btn-primary mt-3">
              Pagar ahora
            </button>
          )}
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold">Tablero de mis servicios</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Revise el estado y las observaciones de cada fase. Cuando su servicio esté en Listo, podrá realizar el pago.
      </p>
      <KanbanBoard
        key={refreshKey}
        role="cliente"
        readOnly
        allowDrag={false}
        onPay={setPayServicio}
      />

      {payServicio && (
        <PaymentModal
          servicio={payServicio}
          onClose={() => setPayServicio(null)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </AppShell>
  );
}
