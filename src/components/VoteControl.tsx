'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function VoteControl({ id, initialTemp }: { id: number, initialTemp: number }) {
  const [temp, setTemp] = useState(initialTemp);
  const [userVote, setUserVote] = useState<number | null>(null); // null = sin votar, 1 = positivo, -1 = negativo
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Al cargar, miramos si el usuario ya ha votado a este chollo
  useEffect(() => {
    const checkUserVote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('votes')
        .select('value')
        .eq('deal_id', id)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserVote(data.value);
      }
    };
    
    checkUserVote();
  }, [id]);

  const handleVote = async (newValue: number) => {
    setLoading(true);
    
    // 1. Comprobamos usuario
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Debes iniciar sesión para votar");
      router.push('/login');
      setLoading(false);
      return;
    }

    // 2. Lógica optimista (calculamos visualmente antes de enviar)
    let newTemp = temp;
    
    if (userVote === newValue) {
      // A. Si pulso lo mismo que ya tenía -> QUITAR VOTO
      newTemp = temp - newValue;
      setUserVote(null); // Visualmente ya no hay voto
      
      // Enviar borrado a Supabase
      await supabase.from('votes').delete().match({ deal_id: id, user_id: user.id });

    } else if (userVote) {
      // B. Si tenía un voto distinto -> CAMBIAR VOTO
      // (Ej: tenía -1 y pulso +1. La diferencia es +2 grados)
      newTemp = temp - userVote + newValue;
      setUserVote(newValue);

      // Enviar update a Supabase (Upsert maneja tanto insert como update)
      await supabase.from('votes').upsert({ deal_id: id, user_id: user.id, value: newValue });

    } else {
      // C. Si no tenía voto -> NUEVO VOTO
      newTemp = temp + newValue;
      setUserVote(newValue);

      // Enviar insert
      await supabase.from('votes').insert({ deal_id: id, user_id: user.id, value: newValue });
    }

    setTemp(newTemp);
    setLoading(false);
    router.refresh(); // Refresca para que otros componentes se enteren si es necesario
  };

  return (
    <div className="flex items-center gap-3 border border-gray-600 bg-gray-800/50 rounded-full px-3 py-1.5 shadow-sm">
      {/* BOTÓN MENOS */}
      <button 
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`transition ${userVote === -1 ? 'text-blue-500 font-bold' : 'text-gray-400 hover:text-blue-400'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
      </button>
      
      {/* TEMPERATURA */}
      {/* Si es positivo Naranja, si es negativo Azul, si es 0 Gris */}
      <span className={`font-bold text-sm ${temp > 0 ? "text-orange-500" : temp < 0 ? "text-blue-500" : "text-gray-400"}`}>
        {temp}°
      </span>
      
      {/* BOTÓN MÁS */}
      <button 
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`transition ${userVote === 1 ? 'text-orange-500 font-bold' : 'text-gray-400 hover:text-orange-500'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
      </button>
    </div>
  );
}