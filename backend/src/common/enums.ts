export enum UserRole {
  ADMIN = 'admin',
  CLIENTE = 'cliente',
  TECNICO = 'tecnico',
}

export enum ServiceStatus {
  PENDIENTE = 'pendiente',
  EN_REPARACION = 'en_reparacion',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
}

export enum PaymentMethod {
  B_BRE = 'b-bre',
  NEQUI = 'nequi',
}

export enum PaymentStatus {
  PENDIENTE = 'pendiente',
  COMPLETADO = 'completado',
  RECHAZADO = 'rechazado',
}

export const KANBAN_COLUMNS = [
  { id: ServiceStatus.PENDIENTE, label: 'Pendiente' },
  { id: ServiceStatus.EN_REPARACION, label: 'En reparación' },
  { id: ServiceStatus.LISTO, label: 'Listo' },
  { id: ServiceStatus.ENTREGADO, label: 'Entregado' },
] as const;
