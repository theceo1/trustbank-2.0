import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!existingProfile) {
          // If profile doesn't exist, create one
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              full_name: user.user_metadata?.full_name || '',
              email: user.email,
              is_verified: false
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newProfile);
        } else {
          setProfile(existingProfile);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
} 