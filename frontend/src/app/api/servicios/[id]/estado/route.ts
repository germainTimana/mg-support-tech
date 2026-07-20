import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-auth';

export async function PATCH(req: NextRequest) {
  return proxyToBackend(req, 'auto', ['admin', 'tecnico'], 'PATCH');
}
