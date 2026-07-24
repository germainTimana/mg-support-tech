import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mg-support-tech-secret-change-in-production',
);

const roleRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  tecnico: ['/tecnico'],
  cliente: ['/cliente'],
};

function getRoleHome(role: string): string {
  if (role === 'admin') return '/admin';
  if (role === 'tecnico') return '/tecnico';
  if (role === 'cliente') return '/cliente';
  return '/login';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const publicPaths = ['/login', '/forgot-password', '/reset-password'];
  const isPublic = publicPaths.some((p) => pathname === p);

  if (!token) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const role = payload.role as string;

    if (isPublic) {
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }

    for (const [allowedRole, prefixes] of Object.entries(roleRoutes)) {
      if (role !== allowedRole) continue;
      if (prefixes.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
      }
    }

    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  } catch {
    if (isPublic) return NextResponse.next();
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/', '/admin/:path*', '/tecnico/:path*', '/cliente/:path*', '/login', '/forgot-password', '/reset-password'],
};
