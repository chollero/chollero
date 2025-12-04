'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-browser'; // Cliente de Browser
import { useRouter } from 'next/navigation';

interface UserMenuProps {
    user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/'); // Redirigir a la página principal
        router.refresh(); // Forzar la recarga de la cabecera
    };
    
    // Obtenemos el avatar de forma segura
    const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=f05e16&color=fff`;
    const fullName = user.user_metadata?.full_name || 'Perfil';

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 p-1 rounded-full bg-[#212428] hover:bg-[#33373b] transition border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
                <span className="text-white text-sm font-semibold hidden md:inline">{fullName}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                        src={avatarUrl} 
                        alt={fullName} 
                        className="w-full h-full object-cover"
                    />
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#212428] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-3 text-sm border-b border-gray-700 text-gray-400">
                        {user.email}
                    </div>
                    <Link 
                        href="/perfil" 
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-white hover:bg-orange-600/30 transition text-sm"
                    >
                        Mi Perfil
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/30 transition text-sm"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
}