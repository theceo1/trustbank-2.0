import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

let supabaseInstance: ReturnType<typeof createClient<Database>>;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storageKey: 'trustbank-auth'
        }
      }
    );
  }
  return supabaseInstance;
}

const supabase = getSupabaseClient();
export default supabase;