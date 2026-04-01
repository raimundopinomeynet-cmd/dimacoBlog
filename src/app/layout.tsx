import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/sidebar';

export const metadata: Metadata = {
  title: 'LLM Brand Monitor',
  description: 'Sistema de Monitoreo de Posicionamiento de Marca en LLMs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-8">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
