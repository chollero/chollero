'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Para alternar entre Login y Registro
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSignUp) {
      // --- LOGICA DE REGISTRO ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0], // Usamos la parte del email antes del @ como nombre temporal
            avatar_url: `https://ui-avatars.com/api/?name=${email}&background=random`
          }
        }
      });
      if (error) setErrorMsg(error.message);
      else {
        alert('¡Cuenta creada! Ya puedes iniciar sesión.');
        setIsSignUp(false); // Pasamos a modo login
      }
    } else {
      // --- LOGICA DE LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setErrorMsg(error.message);
      else {
        router.push('/'); // Si entra bien, lo mandamos a la portada
        router.refresh(); // Refrescamos para que la web sepa que hay usuario
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#181a1b] flex items-center justify-center p-4">
      <div className="bg-[#222529] p-8 rounded-lg shadow-lg max-w-sm w-full border border-gray-700">
        
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h1>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white focus:border-orange-500 outline-none"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#181a1b] border border-gray-600 rounded p-2 text-white focus:border-orange-500 outline-none"
              placeholder="******"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : (isSignUp ? 'Registrarse' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-orange-500 font-bold ml-2 hover:underline"
          >
            {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
          </button>
        </div>

      </div>
    </div>
  );
}