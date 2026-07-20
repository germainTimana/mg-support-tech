import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'MG Support Tech',
  description: 'Sistema de recepción y entrega de computadores',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
