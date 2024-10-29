import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const supabase = createClientComponentClient<Database>();

export default supabase;
