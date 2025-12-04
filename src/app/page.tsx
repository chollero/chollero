import { supabase } from '@/lib/supabase'; // <-- Volvemos al cliente simple
import VoteControl from '@/components/VoteControl';
import Link from 'next/link';
import Tabs from '@/components/Tabs'; 
import DealActions from '@/components/DealActions'; 
import { Tab, getDateISO } from '@/utils/helpers'; // Asegúrate de tener este import
import FeedLayout from '@/components/FeedLayout';

// Eliminamos las importaciones de 'createServerClient' y 'cookies'

export const revalidate = 0; 

// ... (funciones auxiliares) ...

export default async function Home() {
  
  // 1. CONSULTAR DATOS Y FAVORITOS (Usando el cliente simple, el usuario será NULL en el servidor)
  const { data: { user } } = await supabase.auth.getUser();

  let userFavorites: number[] = [];
  // La siguiente lógica se mantendrá, pero user será null, por lo que userFavorites será []
  if (user) {
      const { data } = await supabase.from('favorites').select('deal_id').eq('user_id', user.id);
      if (data) { userFavorites = data.map(f => f.deal_id); }
  }
  
  const activeTab: Tab = 'destacados'; 
  
  // 2. Ejecutar Queries de Feed y Widgets (El resto de la lógica sigue igual)
  let dealsQuery = supabase.from('deals').select('*').order('temperature', { ascending: false });

  const [dealsResult, topTodayResult, topWeekResult] = await Promise.all([
    dealsQuery, 
    supabase.from('deals').select('*').gt('created_at', getDateISO(1)).order('temperature', { ascending: false }).limit(5),
    supabase.from('deals').select('*').gt('created_at', getDateISO(7)).order('temperature', { ascending: false }).limit(5),
  ]);

  const deals = dealsResult.data;
  const topToday = topTodayResult.data;
  const topWeek = topWeekResult.data;
  
  if (dealsResult.error) console.error('Error cargando deals:', dealsResult.error);
  // 3. RENDERIZADO FINAL
  return (
    <main className="min-h-screen bg-[#181a1b] text-gray-300 pb-20 font-sans">
        <FeedLayout 
            deals={deals} 
            topToday={topToday} 
            topWeek={topWeek} 
            activeTab={activeTab} 
            userFavorites={userFavorites}
        />
    </main>
  );
}