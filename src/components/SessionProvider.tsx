'use client';

import { Session } from '@supabase/supabase-js';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase-browser'; // Cliente de Browser

interface SessionContextType {
  session: Session | null;
  user: Session['user'] | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  initialSession: Session | null;
  children: ReactNode;
}

export function SessionProvider({ initialSession, children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(false); // La sesión inicial ya está cargada
  
  const user = session?.user || null;

  // Escucha cambios de Auth (login/logout) en tiempo real en el cliente
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession debe ser usado dentro de un SessionProvider');
  }
  return context;
};