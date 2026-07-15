'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Users, Laptop, Wrench, Plus } from 'lucide-react';
import type { User, Equipo } from '@/lib/types';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'usuarios' | 'recepcion' | 'servicios' | 'tablero'>('tablero');
  const [users, setUsers] = useState<User[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'cliente' as 'cliente' | 'tecnico',
    documentoIdentidad: '',
    telefono: '',
    direccion: '',
  });

  const [equipoForm, setEquipoForm] = useState({
    marca: '',
    modelo: '',
    serial: '',
    descripcionProblema: '',
    clienteId: '',
    accesorios: '',
  });

  const [servicioForm, setServicioForm] = useState({
    equipoId: '',
    clienteId: '',
    tecnicoId: '',
    descripcion: '',
    costoEstimado: '',
  });

  useEffect(() => {
    loadUsers();
    loadEquipos();
  }, []);

  async function loadUsers() {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  }

  async function loadEquipos() {
    const res = await fetch('/api/platos');
    if (res.ok) setEquipos(await res.json());
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`Usuario ${data.nombre} registrado`);
      setUserForm({ ...userForm, nombre: '', email: '', password: '', documentoIdentidad: '', telefono: '', direccion: '' });
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function createEquipo(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/platos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipoForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('Equipo recibido correctamente');
      setEquipoForm({ marca: '', modelo: '', serial: '', descripcionProblema: '', clienteId: '', accesorios: '' });
      loadEquipos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function createServicio(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...servicioForm,
          costoEstimado: Number(servicioForm.costoEstimado),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(`Servicio creado: ${data.codigoServicio}`);
      setServicioForm({ equipoId: '', clienteId: '', tecnicoId: '', descripcion: '', costoEstimado: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  const clientes = users.filter((u) => u.role === 'cliente');
  const tecnicos = users.filter((u) => u.role === 'tecnico');

  const tabs = [
    { id: 'tablero' as const, label: 'Tablero', icon: Wrench },
    { id: 'usuarios' as const, label: 'Usuarios', icon: Users },
    { id: 'recepcion' as const, label: 'Recepción', icon: Laptop },
    { id: 'servicios' as const, label: 'Nuevo servicio', icon: Plus },
  ];

  return (
    <AppShell role="admin" title="Panel Administrador" subtitle="Gestión integral">
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === 'tablero' && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Tablero general</h2>
          <KanbanBoard role="admin" allowDrag />
        </section>
      )}

      {tab === 'usuarios' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={createUser} className="card space-y-3">
            <h2 className="font-semibold">Registrar cliente o técnico</h2>
            <input className="input" placeholder="Nombre completo" value={userForm.nombre} onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Contraseña" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
            <select className="input" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'cliente' | 'tecnico' })}>
              <option value="cliente">Cliente</option>
              <option value="tecnico">Técnico</option>
            </select>
            <input className="input" placeholder="Documento de identidad" value={userForm.documentoIdentidad} onChange={(e) => setUserForm({ ...userForm, documentoIdentidad: e.target.value })} required />
            <input className="input" placeholder="Teléfono" value={userForm.telefono} onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })} />
            <input className="input" placeholder="Dirección" value={userForm.direccion} onChange={(e) => setUserForm({ ...userForm, direccion: e.target.value })} />
            <button type="submit" className="btn-primary">Registrar</button>
          </form>
          <div className="card">
            <h2 className="mb-3 font-semibold">Usuarios registrados</h2>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {users.map((u) => (
                <div key={u._id} className="rounded-lg bg-[var(--bg)] p-3 text-sm">
                  <p className="font-medium">{u.nombre}</p>
                  <p className="text-[var(--muted)]">{u.email} · {u.role}</p>
                  <p className="text-xs">Doc: {u.documentoIdentidad}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'recepcion' && (
        <form onSubmit={createEquipo} className="card mx-auto max-w-xl space-y-3">
          <h2 className="font-semibold">Recepción de equipo</h2>
          <select className="input" value={equipoForm.clienteId} onChange={(e) => setEquipoForm({ ...equipoForm, clienteId: e.target.value })} required>
            <option value="">Seleccionar cliente</option>
            {clientes.map((c) => (
              <option key={c._id} value={c._id}>{c.nombre} - {c.documentoIdentidad}</option>
            ))}
          </select>
          <input className="input" placeholder="Marca" value={equipoForm.marca} onChange={(e) => setEquipoForm({ ...equipoForm, marca: e.target.value })} required />
          <input className="input" placeholder="Modelo" value={equipoForm.modelo} onChange={(e) => setEquipoForm({ ...equipoForm, modelo: e.target.value })} required />
          <input className="input" placeholder="Serial" value={equipoForm.serial} onChange={(e) => setEquipoForm({ ...equipoForm, serial: e.target.value })} />
          <textarea className="input min-h-[80px]" placeholder="Descripción del problema" value={equipoForm.descripcionProblema} onChange={(e) => setEquipoForm({ ...equipoForm, descripcionProblema: e.target.value })} required />
          <input className="input" placeholder="Accesorios recibidos" value={equipoForm.accesorios} onChange={(e) => setEquipoForm({ ...equipoForm, accesorios: e.target.value })} />
          <button type="submit" className="btn-primary">Registrar recepción</button>
        </form>
      )}

      {tab === 'servicios' && (
        <form onSubmit={createServicio} className="card mx-auto max-w-xl space-y-3">
          <h2 className="font-semibold">Crear servicio y asignar</h2>
          <select className="input" value={servicioForm.equipoId} onChange={(e) => {
            const eq = equipos.find((x) => x._id === e.target.value);
            setServicioForm({
              ...servicioForm,
              equipoId: e.target.value,
              clienteId: typeof eq?.clienteId === 'object' ? eq.clienteId._id : (eq?.clienteId as string) || '',
            });
          }} required>
            <option value="">Seleccionar equipo</option>
            {equipos.map((eq) => (
              <option key={eq._id} value={eq._id}>{eq.marca} {eq.modelo} - {typeof eq.clienteId === 'object' ? eq.clienteId.nombre : ''}</option>
            ))}
          </select>
          <select className="input" value={servicioForm.tecnicoId} onChange={(e) => setServicioForm({ ...servicioForm, tecnicoId: e.target.value })} required>
            <option value="">Asignar técnico</option>
            {tecnicos.map((t) => (
              <option key={t._id} value={t._id}>{t.nombre}</option>
            ))}
          </select>
          <textarea className="input min-h-[80px]" placeholder="Descripción del servicio" value={servicioForm.descripcion} onChange={(e) => setServicioForm({ ...servicioForm, descripcion: e.target.value })} required />
          <input className="input" type="number" min="0" placeholder="Costo estimado (COP)" value={servicioForm.costoEstimado} onChange={(e) => setServicioForm({ ...servicioForm, costoEstimado: e.target.value })} required />
          <button type="submit" className="btn-primary">Crear servicio (Pendiente)</button>
        </form>
      )}
    </AppShell>
  );
}
