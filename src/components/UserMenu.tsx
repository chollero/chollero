'use client';

import { createClient } from '@supabase/supabase-js'; // Usamos cliente directo aquí por simplicidad en client components
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Necesitamos recrear el cliente aquí para componentes de cliente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserMenu({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Recargar la página para actualizar el estado
  };

  if (!user) {
    return (
      <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition">
        Iniciar Sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-xs text-gray-400">Hola,</span>
        <span className="text-sm font-bold text-white leading-none">
            {user.user_metadata?.full_name || 'Usuario'}
        </span>
      </div>
      
      <button 
        onClick={handleLogout}
        className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition"
      >
        Salir
      </button>
    </div>
  );
}