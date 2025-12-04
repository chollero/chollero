'use client';

import Link from 'next/link';
import UserMenu from './UserMenu';
import { useSession } from './SessionProvider'; // Usamos el hook global

export default function HeaderActions() {
  const { user } = useSession();

  return (
    <div className="flex items-center gap-4">
      {/* Botón para Subir Chollo */}
      <Link href="/subir" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-bold text-sm transition hidden sm:block">
        + Subir Chollo
      </Link>
      
      {/* Si el usuario está logueado, muestra el menú */}
      {user ? (
        <UserMenu user={user} />
      ) : (
        // Si no está logueado, muestra el botón de Login
        <Link href="/login" className="text-gray-400 hover:text-white transition font-semibold text-sm">
          Iniciar Sesión
        </Link>
      )}
    </div>
  );
}