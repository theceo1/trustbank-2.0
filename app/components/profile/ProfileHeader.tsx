"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import VerificationBadge from './VerificationBadge';
import supabase from '@/lib/supabase/client';

export default function ProfileHeader() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        if (profile?.full_name) {
          setDisplayName(profile.full_name);
        } else if (user.user_metadata?.name) {
          setDisplayName(user.user_metadata.name);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'User');
        }

        setIsVerified(!!user.user_metadata?.is_verified);
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
