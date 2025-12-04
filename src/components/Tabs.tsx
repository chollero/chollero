'use client';

import { useRouter } from 'next/navigation';

type Tab = 'destacados' | 'subiendo' | 'nuevos' | 'semana';

interface TabsProps {
    activeTab: Tab;
}

export default function Tabs({ activeTab }: TabsProps) {
    const router = useRouter();

    const tabs: { label: string; value: Tab; icon: string }[] = [
        { label: 'Destacados', value: 'destacados', icon: '🔥' },
        { label: 'Subiendo', value: 'subiendo', icon: '🚀' },
        { label: 'Nuevos', value: 'nuevos', icon: '🆕' },
        { label: 'Populares', value: 'semana', icon: '🏆' },
    ];

    const handleClick = (tabValue: Tab) => {
        // CAMBIO CLAVE: Navegamos a la ruta /nuevos o /subiendo
        const path = tabValue === 'destacados' ? '/' : `/${tabValue}`;
        
        router.push(path); 
        router.refresh(); // Forzamos la recarga del servidor para obtener los datos
    };

    return (
        <div className="bg-[#222529] p-2 rounded-lg border border-gray-700 shadow-lg sticky top-20 z-40">
            <div className="flex gap-1 overflow-x-auto whitespace-nowrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleClick(tab.value)}
                        className={`py-2 px-4 rounded-md font-bold text-sm transition flex items-center gap-1 shrink-0 ${activeTab === tab.value ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}