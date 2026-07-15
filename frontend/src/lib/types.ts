export type UserRole = 'admin' | 'cliente' | 'tecnico';

export type ServiceStatus =
  | 'pendiente'
  | 'en_reparacion'
  | 'listo'
  | 'entregado';

export type PaymentMethod = 'b-bre' | 'nequi';

export interface User {
  _id: string;
  nombre: string;
  email: string;
  role: UserRole;
  documentoIdentidad: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
}

export interface Equipo {
  _id: string;
  marca: string;
  modelo: string;
  serial?: string;
  descripcionProblema: string;
  clienteId: User | string;
  accesorios?: string;
}

export interface Observacion {
  fase: ServiceStatus;
  texto: string;
  autorId: { nombre: string; role: UserRole } | string;
  fecha: string;
}

export interface Servicio {
  _id: string;
  codigoServicio: string;
  equipoId: Equipo;
  clienteId: User;
  tecnicoId: User;
  estado: ServiceStatus;
  descripcion: string;
  costoEstimado: number;
  observaciones: Observacion[];
  pagado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pago {
  _id: string;
  servicioId: Servicio | string;
  metodo: PaymentMethod;
  monto: number;
  referencia: string;
  telefonoOrigen?: string;
  nombreTitular?: string;
  estado: string;
}

export const KANBAN_COLUMNS: { id: ServiceStatus; label: string; color: string }[] = [
  { id: 'pendiente', label: 'Pendiente', color: 'border-amber-500/50 bg-amber-500/10' },
  { id: 'en_reparacion', label: 'En reparación', color: 'border-blue-500/50 bg-blue-500/10' },
  { id: 'listo', label: 'Listo', color: 'border-emerald-500/50 bg-emerald-500/10' },
  { id: 'entregado', label: 'Entregado', color: 'border-purple-500/50 bg-purple-500/10' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  cliente: 'Cliente',
  tecnico: 'Técnico',
};
