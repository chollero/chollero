// src/components/GlobalHeader.tsx
import Link from 'next/link';
import HeaderActions from './HeaderActions'; 

export default function GlobalHeader() {
  return (
    <header className="bg-[#212428] border-b border-gray-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* LOGO LINK TO HOME */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-orange-500 text-2xl group-hover:text-orange-400 transition">⚡</span>
          <h1 className="hidden sm:block text-xl font-bold text-white tracking-tight group-hover:text-gray-200 transition">CHOLLERO</h1>
        </Link>

        {/* --- NUEVA BARRA DE BÚSQUEDA --- */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form action="/buscar" method="GET">
                <input 
                    type="text"
                    name="q" // Nombre del parámetro de búsqueda
                    placeholder="Buscar ofertas, marcas o categorías..."
                    className="w-full bg-[#181a1b] border border-gray-700 rounded-full p-2 pl-4 text-white text-sm focus:border-orange-500 outline-none transition"
                />
            </form>
        </div>
        
        {/* User Menu and Subir Button (Client Component) */}
        <HeaderActions />
      </div>
    </header>
  );
}