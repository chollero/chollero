import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

// NOTA: Estas variables de entorno deben estar disponibles en el entorno de ejecución
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Crea y devuelve un cliente de Supabase configurado para leer las cookies 
 * de la request de Next.js, permitiendo la autenticación en SSR.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
    // Definimos el handler de cookies de forma segura
    const cookieStore = await cookies();
    
    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
}