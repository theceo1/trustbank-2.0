import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

export function useKYC() {
  const { user } = useAuth();
  const [kycInfo, setKycInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchKYCInfo() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('kyc_verifications')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Set default KYC info if no data exists
        setKycInfo(data || {
          user_id: user.id,
          currentTier: 'unverified',
          completedRequirements: [],
          verificationStatus: 'pending'
        });
      } catch (error) {
        console.error('KYC fetch error:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchKYCInfo();
  }, [user]);

  return { kycInfo, loading, error };
}