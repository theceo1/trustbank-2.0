"use client";

import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import VerificationBadge from './VerificationBadge';

export default function ProfileHeader() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        // Set display name prioritizing metadata name
        if (user.user_metadata?.name) {
          setDisplayName(user.user_metadata.name);
        } else if (profile?.full_name) {
          setDisplayName(profile.full_name);
        } else {
          setDisplayName('User');
        }

        // Check verification status
        setIsVerified(!!user.user_metadata?.is_verified);
      }
    };

    fetchUserData();
  }, [user, supabase]);

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
