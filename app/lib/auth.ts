import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Add other auth utilities as needed