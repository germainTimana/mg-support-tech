import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { UserRole } from '@/lib/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mg-support-tech-secret-change-in-production',
);

export async function getTokenFromRequest(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return req.cookies.get('token')?.value ?? null;
}

export async function verifySession(req: NextRequest) {
  const token = await getTokenFromRequest(req);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return {
      token,
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as UserRole,
      },
    };
  } catch {
    return null;
  }
}

export function unauthorized(message = 'No autorizado') {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbidden(message = 'Acceso denegado') {
  return NextResponse.json({ message }, { status: 403 });
}

export async function proxyToBackend(
  req: NextRequest,
  path: string,
  allowedRoles: UserRole[],
  method?: string,
) {
  const session = await verifySession(req);
  if (!session) return unauthorized();
  if (!allowedRoles.includes(session.user.role)) return forbidden();

  const API_URL =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api';
  const body =
    method !== 'GET' && method !== 'DELETE'
      ? await req.text()
      : undefined;

  const res = await fetch(`${API_URL}${path}`, {
    method: method || req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
    },
    body: body || undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
