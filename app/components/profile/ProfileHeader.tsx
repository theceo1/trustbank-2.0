"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import VerificationBadge from './VerificationBadge';
import supabase from '@/lib/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  is_verified: boolean;
  created_at: string;
}

export default function ProfileHeader() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setDisplayName(data.full_name);
        } else if (user.user_metadata?.name) {
          setDisplayName(user.user_metadata.name);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'User');
        }

        setIsVerified(!!user.user_metadata?.is_verified);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-green-600">
        Welcome, {displayName}
      </h1>
      <div className="mt-2">
        <VerificationBadge isVerified={isVerified} />
      </div>
    </div>
  );
}
