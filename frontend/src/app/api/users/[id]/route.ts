import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  return proxyToBackend(req, 'auto', ['admin']);
}

export async function PATCH(req: NextRequest) {
  return proxyToBackend(req, 'auto', ['admin'], 'PATCH');
}

export async function DELETE(req: NextRequest) {
  return proxyToBackend(req, 'auto', ['admin'], 'DELETE');
}
