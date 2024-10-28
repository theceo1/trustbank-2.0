import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

const supabase = createClientComponentClient<Database>();

if (typeof window !== 'undefined' && !supabase) {
  throw new Error('Failed to initialize Supabase client');
}

export default supabase;
