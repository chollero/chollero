// src/app/layout.tsx
import './globals.css';
import GlobalHeader from '@/components/GlobalHeader';
import { createServerSupabaseClient } from '@/lib/supabase-server'; // Cliente SSR
import { SessionProvider } from '@/components/SessionProvider'; // Proveedor de estado

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // 1. Obtener la sesión en el SERVIDOR (SSR)
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  return (
    <html lang="es">
      <body className="bg-[#181a1b]">
        {/* 2. Proveedor de Sesión envuelve toda la App */}
        <SessionProvider initialSession={session}> 
          <GlobalHeader />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}