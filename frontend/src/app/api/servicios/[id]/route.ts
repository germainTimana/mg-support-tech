import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(req, `/servicios/${id}/estado`, ['admin', 'tecnico']);
}
