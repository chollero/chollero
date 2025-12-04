import { createServerSupabaseClient } from '@/lib/supabase-server'; // Cliente SSR
import FeedLayout from '@/components/FeedLayout'; 
import { Tab, getDateISO } from '@/utils/helpers';
import { supabase } from '@/lib/supabase-browser'; // Cliente simple para las consultas

export const revalidate = 0; 

// --- FUNCIONES AUXILIARES (Debe moverlas a helpers.ts si aún las tiene aquí) ---
// ... (Asegúrese de que timeAgo, getDateISO y Tab se importan de '@/utils/helpers')

export default async function Home() {
  
  // 1. INICIALIZAR CLIENTE DE SERVIDOR (FIX de Cookies)
  const serverSupabase = await createServerSupabaseClient();
  
  const activeTab: Tab = 'destacados'; 
  
  // 2. Identificar usuario y obtener favoritos
  const { data: { user } } = await serverSupabase.auth.getUser(); // Usamos el cliente SSR

  let userFavorites: number[] = [];
  if (user) {
      // Usamos el cliente SSR para consultas seguras
      const { data } = await serverSupabase.from('favorites').select('deal_id').eq('user_id', user.id);
      if (data) { userFavorites = data.map(f => f.deal_id); }
  }

  // 3. Ejecutar Queries
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
  
  // 4. RENDERIZADO FINAL
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