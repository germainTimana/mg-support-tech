import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role === 'admin') redirect('/admin');
  if (session.role === 'tecnico') redirect('/tecnico');
  if (session.role === 'cliente') redirect('/cliente');
  redirect('/login');
}
