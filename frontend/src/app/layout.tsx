import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MG Support Tech',
  description: 'Sistema de recepción y entrega de computadores',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
