import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserRole } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mg-support-tech-secret-change-in-production',
);

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  nombre?: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      nombre: payload.nombre as string | undefined,
    };
  } catch {
    return null;
  }
}

export function hasRole(user: SessionUser | null, roles: UserRole[]): boolean {
  return !!user && roles.includes(user.role);
}
