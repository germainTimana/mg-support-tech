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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        /* continue to login */
      }
    }
    return NextResponse.next();
  }

  const protectedPaths = ['/admin', '/tecnico', '/cliente'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const role = payload.role as string;

    for (const [allowedRole, prefixes] of Object.entries(roleRoutes)) {
      if (role !== allowedRole) continue;
      if (prefixes.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
      }
    }

    const home =
      role === 'admin' ? '/admin' : role === 'tecnico' ? '/tecnico' : '/cliente';
    return NextResponse.redirect(new URL(home, request.url));
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/tecnico/:path*', '/cliente/:path*', '/login'],
};
