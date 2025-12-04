'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

interface DealActionsProps {
    dealId: number;
    initialIsSaved: boolean;
    dealTitle: string;
    dealLink: string;
}

export default function DealActions({ dealId, initialIsSaved, dealTitle, dealLink }: DealActionsProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            // Utilizamos getUser para una verificación asíncrona segura
            const { data: { user } } = await supabase.auth.getUser();
            setIsUserLoggedIn(!!user);
        };
        checkUser();
    }, []);

    const handleFavorite = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert('Debes iniciar sesión para guardar un chollo.');
            return;
        }

        const actionWasSave = !isSaved; 
        setIsSaved(actionWasSave); // Optimistic UI update

        if (actionWasSave) {
            // --- AÑADIR FAVORITO ---
            const { error } = await supabase.from('favorites').insert({ 
                deal_id: dealId, 
                user_id: user.id // Usamos la ID del usuario de la sesión resuelta
            });
            
            if (error) {
                console.error('Error al guardar favorito (RLS o DB):', error.message);
                setIsSaved(false); // Revertir si falla
                alert(`Error al guardar: ${error.message}. ¿RLS?`);
            }
        } else {
            // --- ELIMINAR FAVORITO ---
            const { error } = await supabase.from('favorites').delete().match({ 
                deal_id: dealId, 
                user_id: user.id 
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