'use client';

import { supabase } from '@/lib/supabase-browser'; // Cliente de Browser
import { useState } from 'react';
import { useSession } from './SessionProvider'; // Importamos el hook global

interface DealActionsProps {
    dealId: number;
    initialIsSaved: boolean;
    dealTitle: string;
    dealLink: string;
}

export default function DealActions({ dealId, initialIsSaved, dealTitle, dealLink }: DealActionsProps) {
    const { user } = useSession(); // <-- USAMOS EL ESTADO GLOBAL
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    
    // El estado de login se determina directamente por el hook
    const isUserLoggedIn = !!user;

    const handleFavorite = async () => {
        const userId = user?.id; // Obtenemos la ID directamente del contexto

        if (!isUserLoggedIn || !userId) {
            alert('Debes iniciar sesión para guardar un chollo.');
            return;
        }

        const actionWasSave = !isSaved; 
        setIsSaved(actionWasSave); // Optimistic UI update

        if (actionWasSave) {
            // Añadir favorito
            const { error } = await supabase.from('favorites').insert({ 
                deal_id: dealId, 
                user_id: userId
            });
            
            if (error) {
                console.error('Error al guardar favorito:', error.message);
                setIsSaved(false); // Revertir si falla
                alert(`Error al guardar: ${error.message}`);
            }
        } else {
            // Eliminar favorito
            const { error } = await supabase.from('favorites').delete().match({ 
                deal_id: dealId, 
                user_id: userId
            });
            
            if (error) {
                console.error('Error al eliminar favorito:', error.message);
                setIsSaved(true); // Revertir si falla
                alert(`Error al eliminar: ${error.message}`);
            }
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: dealTitle,
                url: dealLink,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(`¡Mira este chollo!: ${dealTitle} - ${dealLink}`);
            alert('Enlace copiado al portapapeles.');
        }
    };

    return (
        <div className="flex gap-4 items-center text-sm text-gray-400">
            {/* Botón Guardar en Favoritos */}
            <button 
                onClick={handleFavorite} 
                className={`flex items-center gap-1 transition ${isSaved ? 'text-red-500 font-bold' : 'hover:text-white'}`}
            >
                {isSaved ? '❤️' : '🤍'} Guardar
            </button>

            {/* Botón Compartir */}
            <button onClick={handleShare} className="flex items-center gap-1 hover:text-white transition">
                🔗 Compartir
            </button>
        </div>
    );
}