import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  return proxyToBackend(req, 'auto', ['admin', 'tecnico', 'cliente'], 'POST');
}
