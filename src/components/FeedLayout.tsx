// src/components/FeedLayout.tsx (Componente de Servidor)

import VoteControl from '@/components/VoteControl';
import Link from 'next/link';
import Tabs from '@/components/Tabs'; 
import DealActions from '@/components/DealActions'; 
import { timeAgo, Tab } from '@/utils/helpers'; // Importamos las funciones auxiliares

interface Deal {
    id: number;
    title: string;
    price: number;
    original_price: number;
    link: string;
    image_url: string;
    temperature: number;
    created_at: string;
}

interface FeedLayoutProps {
    deals: Deal[] | null;
    topToday: Deal[] | null;
    topWeek: Deal[] | null;
    activeTab: Tab;
    userFavorites: number[];
}

export default function FeedLayout({ deals, topToday, topWeek, activeTab, userFavorites }: FeedLayoutProps) {
    
    // RENDERIZADO
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        
        {/* === COLUMNA IZQUIERDA: FEED DE CHOLLOS === */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* PESTAÑAS (Interacción de cliente) */}
          <Tabs activeTab={activeTab} />
          
          {/* LISTADO DE CHOLLOS */}
          {deals?.length === 0 && (
             <p className="text-gray-500 text-center py-8">No hay chollos en esta sección aún.</p>
          )}

          {deals?.map((deal) => {
            const hasDiscount = deal.original_price > deal.price;
            const discountPercentage = hasDiscount 
              ? Math.round(((deal.original_price - deal.price) / deal.original_price) * 100) 
              : 0;
            
            const isDealSaved = userFavorites.includes(deal.id);

            return (
              <div key={deal.id} className="bg-[#222529] rounded-lg border border-gray-700/50 overflow-hidden flex flex-col md:flex-row group relative shadow-md">
                
                <a href={deal.link || '#'} target="_blank" className="absolute inset-0 z-0"></a>

                {/* 1. IMAGEN */}
                <div className="w-full md:w-56 md:min-w-[220px] h-64 md:h-auto bg-[#222529] p-3 flex items-center justify-center relative z-0">
                  <div className="bg-white w-full aspect-square rounded-lg flex items-center justify-center p-2 overflow-hidden shadow-sm z-10 relative">
                      <img 
                        src={deal.image_url || 'https://via.placeholder.com/300'} 
                        alt={deal.title}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                  </div>
                </div>
                
                {/* 2. INFO */}
                <div className="flex-1 p-4 flex flex-col relative z-0">
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <VoteControl id={deal.id} initialTemp={deal.temperature || 0} />
                    <span className="text-xs text-gray-400">Hace {timeAgo(deal.created_at)}</span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-100 leading-tight mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                      {deal.title}
                  </h2>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-orange-500">{deal.price}€</span>
                    {hasDiscount && (
                      <>
                        <span className="text-sm text-gray-500 line-through">{deal.original_price}€</span>
                        <span className="bg-[#1a4731] text-[#4bb876] border border-[#265e3f] text-xs font-bold px-1.5 py-0.5 rounded">
                          -{discountPercentage}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-700">
                    {/* BOTONES DE ACCIÓN (PASAMOS EL ESTADO INICIAL) */}
                    <DealActions 
                        dealId={deal.id}
                        initialIsSaved={isDealSaved}
                        dealTitle={deal.title}
                        dealLink={deal.link}
                    />

                    <a href={deal.link || '#'} target="_blank" rel="noopener noreferrer"
                      className="bg-[#f05e16] hover:bg-[#d64e0f] text-white px-5 py-2 rounded font-bold text-sm transition relative z-10">
                      Ir al chollo ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* === COLUMNA DERECHA: SIDEBAR (Widgets) === */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* WIDGET 1: TOP HOY */}
          <div className="bg-[#222529] rounded-lg border border-gray-700/50 p-4 shadow-md sticky top-20">
            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
              <span>🌟</span> Top del Día
            </h3>
            
            <div className="flex flex-col gap-4">
              {topToday?.length === 0 && <p className="text-sm text-gray-500">Sin votos hoy.</p>}
              
              {topToday?.map((deal, index) => (
                <Link key={deal.id} href={deal.link || '#'} target="_blank" className="flex gap-3 group">
                   <span className="text-lg font-bold text-gray-600 w-4">{index + 1}</span>
                   <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 shrink-0">
                      <img src={deal.image_url || ''} className="max-w-full max-h-full object-contain" />
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <h4 className="text-sm font-medium text-gray-300 truncate group-hover:text-orange-400 transition">
                        {deal.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-orange-500 font-bold">{deal.price}€</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">🔥 {deal.temperature}°</span>
                      </div>
                   </div>
                </Link>
              ))}
            </div>
          </div>

          {/* WIDGET 2: TOP SEMANA */}
          <div className="bg-[#222529] rounded-lg border border-gray-700/50 p-4 shadow-md hidden lg:block">
            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
              <span>⭐</span> Destacados de la Semana
            </h3>
            
            <div className="flex flex-col gap-4">
               {topWeek?.length === 0 && <p className="text-sm text-gray-500">Sin votos esta semana.</p>}

               {topWeek?.map((deal, index) => (
                <Link key={deal.id} href={deal.link || '#'} target="_blank" className="flex gap-3 group">
                   <span className="text-lg font-bold text-gray-600 w-4">{index + 1}</span>
                   <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 shrink-0">
                      <img src={deal.image_url || ''} className="max-w-full max-h-full object-contain" />
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <h4 className="text-sm font-medium text-gray-300 truncate group-hover:text-orange-400 transition">
                        {deal.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-orange-500 font-bold">{deal.price}€</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">🔥 {deal.temperature}°</span>
                      </div>
                   </div>
                </Link>
              ))}
            </div>
          </div>

        </aside>

      </div>
    );
}