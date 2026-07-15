'use client';

import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import type { Servicio, PaymentMethod } from '@/lib/types';

interface PaymentModalProps {
  servicio: Servicio;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ servicio, onClose, onSuccess }: PaymentModalProps) {
  const [metodo, setMetodo] = useState<PaymentMethod>('nequi');
  const [referencia, setReferencia] = useState('');
  const [telefonoOrigen, setTelefonoOrigen] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const equipo = typeof servicio.equipoId === 'object' ? servicio.equipoId : null;

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicioId: servicio._id,
          metodo,
          monto: servicio.costoEstimado,
          referencia,
          telefonoOrigen,
          nombreTitular,
          notas,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Pagar servicio
            </h2>
            <p className="font-mono text-sm text-blue-400">{servicio.codigoServicio}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--surface-hover)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-[var(--bg)] p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--muted)]">Resumen del servicio</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-[var(--muted)]">Equipo:</span>{' '}
              {equipo?.marca} {equipo?.modelo}
            </p>
            <p>
              <span className="text-[var(--muted)]">Problema:</span>{' '}
              {equipo?.descripcionProblema}
            </p>
            <p>
              <span className="text-[var(--muted)]">Servicio:</span> {servicio.descripcion}
            </p>
            <p className="pt-2 text-lg font-bold text-emerald-400">
              Total: ${servicio.costoEstimado.toLocaleString()} COP
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Método de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {(['nequi', 'b-bre'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodo(m)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition ${
                    metodo === m
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-[var(--border)] hover:border-emerald-500/50'
                  }`}
                >
                  {m === 'b-bre' ? 'B-Bre' : 'Nequi'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Referencia / Nº de transacción</label>
            <input
              className="input"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ej: 1234567890"
              required
            />
          </div>

          <div>
            <label className="label">Teléfono origen</label>
            <input
              className="input"
              value={telefonoOrigen}
              onChange={(e) => setTelefonoOrigen(e.target.value)}
              placeholder="300 123 4567"
            />
          </div>

          <div>
            <label className="label">Nombre del titular</label>
            <input
              className="input"
              value={nombreTitular}
              onChange={(e) => setNombreTitular(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <textarea
              className="input min-h-[60px]"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            onClick={handlePay}
            disabled={loading || !referencia}
            className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? 'Procesando...' : `Confirmar pago $${servicio.costoEstimado.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
