import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ codigo: string }> },
) {
  const { codigo } = await params;
  return proxyToBackend(req, `/servicios/codigo/${codigo}`, ['admin', 'tecnico', 'cliente']);
}
