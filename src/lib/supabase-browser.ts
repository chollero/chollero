import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Cliente para Componentes de Cliente (Browser)
export const supabase = createClient(supabaseUrl!, supabaseKey!);

// 2. Cliente para Componentes de Servidor (SSR/Cookies)
// Esta es la función que deben usar page.tsx y [filterType]/page.tsx
export function createServerSupabaseClient() {
    // Definimos el handler de cookies para que TypeScript no se confunda (el error que tenías)
    const cookieStore = cookies();
    
    // Devolvemos el cliente configurado con el handler de cookies
    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
}