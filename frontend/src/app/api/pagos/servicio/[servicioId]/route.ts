import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ servicioId: string }> },
) {
  const { servicioId } = await params;
  return proxyToBackend(req, `/pagos/servicio/${servicioId}`, ['admin', 'cliente', 'tecnico']);
}
