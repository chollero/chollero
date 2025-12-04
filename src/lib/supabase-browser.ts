import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Exportamos el cliente de Supabase estándar (sin cookies ni server-side logic)
export const supabase = createClient(supabaseUrl!, supabaseKey!);