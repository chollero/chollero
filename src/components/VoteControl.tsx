'use client';

import { supabase } from '@/lib/supabase-browser';
import { useState } from 'react';
import { useSession } from './SessionProvider'; // Importamos el hook global

interface VoteControlProps {
    id: number;
    initialTemp: number;
}

export default function VoteControl({ id, initialTemp }: VoteControlProps) {
    const { user } = useSession(); // <-- USAMOS EL ESTADO GLOBAL
    const [temperature, setTemperature] = useState(initialTemp);
    const [userVoted, setUserVoted] = useState<'up' | 'down' | null>(null);

    const handleVote = async (type: 'up' | 'down') => {
        const userId = user?.id; // Obtenemos la ID directamente del contexto
        
        if (!userId) {
            alert('Debes iniciar sesión para votar.');
            return;
        }

        // ... (Tu lógica de voto sigue aquí) ...
        
        // 1. Determinar el cambio de temperatura
        let newTemp = temperature;
        let voteValue = type === 'up' ? 1 : -1;

        if (userVoted === type) {
            // Deshacer el voto
            voteValue = type === 'up' ? -1 : 1;
            setUserVoted(null);
            newTemp += voteValue;
            
            // Eliminar de la tabla votes
            await supabase.from('votes').delete().match({ deal_id: id, user_id: userId });
        } else {
            if (userVoted) {
                // Cambiar voto (restar el viejo y sumar el nuevo)
                newTemp += (userVoted === 'up' ? -1 : 1); 
            }
            
            newTemp += voteValue;
            setUserVoted(type);
            
            // Insertar o actualizar en la tabla votes
            await supabase.from('votes').upsert(
                { deal_id: id, user_id: userId, type: type },
                { onConflict: 'deal_id, user_id' }
            );
        }

        // 2. Actualizar el chollo con la nueva temperatura
        await supabase.from('deals').update({ temperature: newTemp }).eq('id', id);
        setTemperature(newTemp);
    };

    return (
        <div className="flex items-center gap-1 bg-gray-900/50 rounded-full p-1 border border-gray-700">
            {/* Botón ARRIBA (UP) */}
            <button
                onClick={() => handleVote('up')}
                className={`w-8 h-8 rounded-full text-lg transition ${userVoted === 'up' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                title="Voto positivo"
            >
                ▲
            </button>
            
            {/* Indicador de Temperatura */}
            <span className="text-white text-md font-bold mx-1">{temperature}°</span>
            
            {/* Botón ABAJO (DOWN) */}
            <button
                onClick={() => handleVote('down')}
                className={`w-8 h-8 rounded-full text-lg transition ${userVoted === 'down' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                title="Voto negativo"
            >
                ▼
            </button>
        </div>
    );
}