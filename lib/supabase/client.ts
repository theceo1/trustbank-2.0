import { createClient } from '@supabase/supabase-js';

let supabase: any;

if (!supabase) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default supabase;
