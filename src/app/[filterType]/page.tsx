import { supabase } from '@/lib/supabase'; // Cliente simple y estable
import FeedLayout from '@/components/FeedLayout'; 
import { Tab, getDateISO } from '@/utils/helpers'; 
import VoteControl from '@/components/VoteControl'; 
import Link from 'next/link';
import DealActions from '@/components/DealActions';

export const revalidate = 0; 

export default async function FilteredHomePage({ params }: { params: { filterType: string } }) {
 
    // 🛑 SOLUCIÓN AL CRASH DE RUNTIME: Forzamos el await sobre params
    const resolvedParams = await (params as any);
 
    const activeTab: Tab = (resolvedParams.filterType as Tab); 
 
 // 1. IDENTIFICAR USUARIO Y OBTENER FAVORITOS (No persiste estado en recarga, pero funciona)
 const { data: { user } } = await supabase.auth.getUser();
 let userFavorites: number[] = [];
 if (user) {
   const { data } = await supabase.from('favorites').select('deal_id').eq('user_id', user.id);
   if (data) { userFavorites = data.map(f => f.deal_id); }
 }
 
 // 2. Definir Query para la pestaña
 let dealsQuery = supabase.from('deals').select('*');

 switch (activeTab) {
  case 'nuevos':
   dealsQuery = dealsQuery.order('created_at', { ascending: false });
   break;
  case 'subiendo':
   dealsQuery = dealsQuery.gt('created_at', getDateISO(2)).order('temperature', { ascending: false });
   break;
  case 'semana':
   dealsQuery = dealsQuery.gt('created_at', getDateISO(7)).order('temperature', { ascending: false });
   break;
  default:
   dealsQuery = supabase.from('deals').select('*').order('temperature', { ascending: false });
   break;
 }
 
 // 3. Ejecutar Queries
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