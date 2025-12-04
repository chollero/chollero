'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SubirChollo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. Al cargar la página, verificamos quién es el usuario
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si no hay usuario, lo mandamos al login
        router.replace('/login');
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return alert('Debes iniciar sesión');
    
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');
    const price = formData.get('price');
    const original_price = formData.get('original_price');
    const image_url = formData.get('image_url');
    const link = formData.get('link');

    // 2. LA SOLUCIÓN: Añadimos 'user_id' al objeto que enviamos
    const { error } = await supabase.from('deals').insert({
      title,
      price,
      original_price,
      image_url,
      link,
      user_id: user.id, // <--- ¡ESTO ES LO QUE FALTABA!
      category_id: 1 // Ponemos 1 (Electrónica) por defecto para que no falle, luego haremos selector
    });

    if (error) {
      alert('Error al subir: ' + error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  if (!user) return null; // No mostramos nada hasta cargar el usuario

  return (
    <div className="min-h-screen bg-[#181a1b] text-gray-300 flex items-center justify-center p-4">
      <div className="bg-[#222529] p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6">Publicar nuevo chollo</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Título del producto</label>
            <input 
              name="title" 
              required 
              type="text" 
              placeholder="Ej: iPhone 15 Pro"
              className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white focus:border-orange-500 outline-none"
            />
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Precio Oferta</label>
              <input 
                name="price" 
                required 
                type="number" 
                placeholder="999"
                className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Precio Original</label>
              <input 
                name="original_price" 
                required 
                type="number" 
                placeholder="1200"
                className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Link y Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Enlace a la oferta</label>
            <input 
              name="link" 
              required 
              type="url" 
              placeholder="https://..."
              className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">URL de la Imagen</label>
            <input 
              name="image_url" 
              type="url" 
              placeholder="https://..."
              className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white focus:border-orange-500 outline-none"
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-500 transition disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar Chollo'}
          </button>

        </form>
      </div>
    </div>
  );
}