'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HeaderActions() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    // Evitamos que el clic en "Salir" dispare el Link de ir al perfil
    e.preventDefault(); 
    e.stopPropagation();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) return <div className="text-sm text-gray-500">...</div>;

  if (!user) {
    return (
      <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition">
        Iniciar Sesión
      </Link>
    );
  }

  // Recuperamos el nombre y el avatar (o usamos uno por defecto)
  const userName = user.user_metadata?.full_name || 'Usuario';
  const userAvatar = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${userName}&background=random`;

  return (
    <div className="flex items-center gap-4">
      {/* Botón Subir */}
      <Link 
        href="/subir" 
        className="hidden md:block bg-orange-600 text-white px-4 py-1.5 rounded-full font-bold text-xs hover:bg-orange-500 transition shadow-sm"
      >
        + Subir
      </Link>

      {/* BLOQUE DE PERFIL (Foto + Texto) */}
      <Link 
        href="/perfil" 
        className="flex items-center gap-3 pl-4 border-l border-gray-700 group cursor-pointer"
      >
        {/* Texto (Alineado a la derecha para que quede pegado a la foto) */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-gray-400 leading-tight">Hola,</span>
          <span className="text-sm font-bold text-white leading-tight group-hover:text-orange-500 transition">
            {userName}
          </span>
        </div>

        {/* AVATAR (Círculo con imagen) */}
        <div className="relative">
            <img 
              src={userAvatar} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 group-hover:border-orange-500 transition"
            />
            {/* Puntito verde de "Online" (Decorativo) */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#212428] rounded-full"></span>
        </div>
      </Link>
      
      {/* Botón Salir (Pequeño y discreto al lado) */}
      <button 
        onClick={handleLogout}
        className="text-xs text-gray-500 hover:text-white ml-2 transition"
        title="Cerrar sesión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      </button>

    </div>
  );
}