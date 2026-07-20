import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  return proxyToBackend(req, 'auto', ['admin', 'tecnico', 'cliente']);
}
