'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Definimos los tipos de pestañas
type ProfileTab = 'posts' | 'settings' | 'favorites';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // Inicializamos con la pestaña de posts
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts'); 
    
    // Datos del usuario
    const [myDeals, setMyDeals] = useState<any[]>([]);
    const [myFavorites, setMyFavorites] = useState<any[]>([]); // <-- ESTADO DE FAVORITOS
    const [formData, setFormData] = useState({ full_name: '', avatar_url: '', password: '' });

    // 1. CARGAR DATOS
    const getData = useCallback(async () => {
        // A. Verificar usuario
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.replace('/login');
            return;
        }
        setUser(user);
        setFormData({
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            password: ''
        });

        // B. Cargar sus chollos (Propios)
        const { data: deals } = await supabase
            .from('deals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        // C. Cargar Favoritos (Usando JOIN implícito 'deals(*)')
        const { data: favorites } = await supabase
            .from('favorites')
            .select('*, deals(*)') // Traemos la fila de favorito Y la información completa del chollo
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
        if (deals) setMyDeals(deals);
        if (favorites) setMyFavorites(favorites.map(f => f.deals).filter(d => d !== null)); // Extraemos los chollos y filtramos si la relación falló
        setLoading(false);
    }, [router]);
    
    useEffect(() => {
      getData();
    }, [getData]);

    // 2. FUNCIONES DE ACCIÓN

    // Borrar un chollo propio
    const handleDeleteDeal = async (id: number) => {
      if (!confirm('¿Seguro que quieres borrar este chollo?')) return;

      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) alert('Error al borrar: ' + error.message);
      else {
        // Actualizamos las listas visualmente
        setMyDeals(myDeals.filter(d => d.id !== id));
      }
    };
    
    // Función para quitar un chollo de favoritos
    const handleUnfavorite = async (dealId: number) => {
        if (!confirm('¿Seguro que quieres quitar este chollo de favoritos?')) return;
        
        // --- FIX: Obtener la sesión del usuario de forma ASÍNCRONA ---
        const { data: { user } } = await supabase.auth.getUser(); 
        
        if (!user) return; // Si no hay usuario, salimos

        const { error } = await supabase.from('favorites')
            .delete()
            .match({ deal_id: dealId, user_id: user.id }); // Usamos la ID correcta

        if (error) alert('Error al quitar favorito: ' + error.message);
        else {
            // Actualizamos la lista de favoritos visualmente
            setMyFavorites(myFavorites.filter(d => d.id !== dealId));
        }
    };


    // Actualizar perfil (Nombre y Avatar)
    const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: formData.avatar_url
        }
      });

      if (error) alert('Error: ' + error.message);
      else {
        alert('Perfil actualizado correctamente');
        router.refresh(); 
      }
    };

    // Cambiar contraseña
    const handleChangePassword = async () => {
      if (!formData.password) return alert('Escribe una contraseña nueva');
      
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) alert('Error: ' + error.message);
      else {
        alert('Contraseña cambiada. Usa la nueva la próxima vez.');
        setFormData({ ...formData, password: '' });
      }
    };

    if (loading) return <div className="min-h-screen bg-[#181a1b] text-white flex items-center justify-center">Cargando perfil...</div>;

    // Función auxiliar para renderizar la tarjeta de chollo en el perfil
    const renderDealCard = (deal: any, isFavoriteView: boolean) => (
        <div key={deal.id} className="bg-[#222529] p-4 rounded-lg border border-gray-700 flex gap-4 items-center shadow-sm hover:border-gray-600 transition">
            <div className="w-16 h-16 bg-white rounded flex items-center justify-center p-1 shrink-0">
                <img src={deal.image_url} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{deal.title}</h3>
                <div className="text-orange-500 font-bold">{deal.price}€</div>
            </div>
            {isFavoriteView ? (
                // Botón Quitar Favorito
                <button 
                    onClick={() => handleUnfavorite(deal.id)}
                    className="bg-red-500/10 text-red-500 p-2 rounded hover:bg-red-500 hover:text-white transition"
                    title="Quitar de favoritos"
                >
                    ❌
                </button>
            ) : (
                // Botón Borrar Propio Chollo
                <button 
                    onClick={() => handleDeleteDeal(deal.id)}
                    className="bg-red-500/10 text-red-500 p-2 rounded hover:bg-red-500 hover:text-white transition"
                    title="Borrar chollo"
                >
                    🗑️
                </button>
            )}
        </div>
    );
    
    // RENDERIZADO PRINCIPAL
    return (
      <main className="min-h-screen bg-[#181a1b] text-gray-300 pb-20">
        
        {/* CABECERA DE PERFIL */}
        <div className="bg-[#212428] border-b border-gray-700 pt-10 pb-6 px-4">
          <div className="max-w-4xl mx-auto flex items-center gap-6">
            {/* Avatar Grande */}
            <div className="w-24 h-24 rounded-full border-4 border-[#181a1b] overflow-hidden bg-gray-700 shadow-xl">
              <img 
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user?.user_metadata?.full_name || 'Usuario'}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex gap-4 mt-3">
                 <div className="text-sm"><span className="font-bold text-white">{myDeals.length}</span> chollos subidos</div>
                 <div className="text-sm"><span className="font-bold text-white">{myFavorites.length}</span> favoritos</div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS (Pestañas) */}
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="flex border-b border-gray-700 mb-6">
            
            {/* BOTÓN MIS CHOLLOS */}
            <button 
              onClick={() => setActiveTab('posts')}
              className={`pb-3 px-4 font-bold transition ${activeTab === 'posts' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}
            >
              Mis Chollos
            </button>
            
            {/* BOTÓN FAVORITOS (NUEVO) */}
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`pb-3 px-4 font-bold transition ${activeTab === 'favorites' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}
            >
              ❤️ Favoritos ({myFavorites.length})
            </button>

            {/* BOTÓN AJUSTES */}
            <button 
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-4 font-bold transition ${activeTab === 'settings' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}
            >
              Ajustes
            </button>
          </div>

          {/* === 1. CONTENIDO: MIS CHOLLOS === */}
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myDeals.length === 0 && (
                <div className="col-span-2 text-center py-10 bg-[#222529] rounded-lg border border-gray-700 border-dashed">
                  <p className="mb-4">Aún no has subido ningún chollo.</p>
                  <Link href="/subir" className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600">
                    Subir el primero
                  </Link>
                </div>
              )}
              {myDeals.map(deal => renderDealCard(deal, false))}
            </div>
          )}
          
          {/* === 2. CONTENIDO: FAVORITOS (NUEVO BLOQUE) === */}
          {activeTab === 'favorites' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myFavorites.length === 0 && (
                    <div className="col-span-2 text-center py-10 bg-[#222529] rounded-lg border border-gray-700 border-dashed">
                      <p className="mb-4">Aún no has guardado ningún chollo como favorito.</p>
                    </div>
                )}
                {/* Reutilizamos la tarjeta, pasando 'true' para vista de favoritos */}
                {myFavorites.map(deal => renderDealCard(deal, true))}
             </div>
          )}

          {/* === 3. CONTENIDO: AJUSTES === */}
          {activeTab === 'settings' && (
            <div className="max-w-lg">
              
              {/* Formulario Perfil */}
              <form onSubmit={handleUpdateProfile} className="bg-[#222529] p-6 rounded-lg border border-gray-700 mb-8 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Editar Perfil</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre Público</label>
                    <input 
                      type="text" 
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Avatar (URL)</label>
                    <input 
                      type="url" 
                      value={formData.avatar_url}
                      onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white outline-none focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pega un enlace de imagen (ej: de imgur.com o unspash).
                    </p>
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-500 transition">
                    Guardar Cambios
                  </button>
                </div>
              </form>

              {/* Formulario Seguridad */}
              <div className="bg-[#222529] p-6 rounded-lg border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Seguridad</h2>
                
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-1">Nueva Contraseña</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="******"
                      className="flex-1 bg-[#181a1b] border border-gray-600 rounded p-2 text-white outline-none focus:border-orange-500"
                    />
                    <button 
                      type="button"
                      onClick={handleChangePassword} 
                      className="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-600 transition"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6 mt-6">
                  <h3 className="text-red-500 font-bold mb-2">Zona de Peligro</h3>
                  <p className="text-sm text-gray-500 mb-4">Si borras tu cuenta, perderás todos tus datos y chollos.</p>
                  <button 
                    type="button"
                    onClick={() => alert("Para borrar tu cuenta completamente, por seguridad, contacta con el administrador.")}
                    className="border border-red-500 text-red-500 px-4 py-2 rounded font-bold hover:bg-red-500 hover:text-white transition w-full md:w-auto"
                  >
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    );
}