import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

let supabase: ReturnType<typeof createClientComponentClient<Database>>;

if (typeof window !== 'undefined') {
  supabase = createClientComponentClient<Database>();
}

export default supabase!;
