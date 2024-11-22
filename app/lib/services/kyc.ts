import { createClient } from '@supabase/supabase-js';
import { KYCVerification, KYCDocument, KYCInfo } from '@/app/types/kyc';
import { Database } from '@/types/supabase';
import { KYC_TIERS } from '@/app/lib/constants/kyc-tiers';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type KYCStatusType = 'unverified' | 'pending' | 'verified' | 'rejected';

interface EligibilityResponse {
  eligible: boolean;
  reason?: string;
}

export const KYCService = {
  uploadDocument: async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `kyc-documents/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) throw new Error('Failed to upload document');

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  submitBasicVerification: async (userId: string, data: any) => {
    try {
      const verificationData = {
        user_id: userId,
        level: 1,
        status: 'pending' as const,
        verification_type: 'basic',
        verification_data: data,
      };

      const { error } = await supabase
        .from('kyc_verifications')
        .insert(verificationData);

      if (error) throw error;

    } catch (error) {
      console.error('Basic verification error:', error);
      throw error;
    }
  },

  submitIntermediateVerification: async (userId: string, data: any) => {
    try {
      const verificationData = {
        user_id: userId,
        level: 2,
        status: 'pending' as const,
        verification_type: 'intermediate',
        verification_data: data,
      };

      const { error } = await supabase
        .from('kyc_verifications')
        .insert(verificationData);

      if (error) throw error;

    } catch (error) {
      console.error('Intermediate verification error:', error);
      throw error;
    }
  },

  submitAdvancedVerification: async (userId: string, data: any) => {
    try {
      const verificationData = {
        user_id: userId,
        level: 3,
        status: 'pending' as const,
        verification_type: 'advanced',
        verification_data: data,
      };

      const { error } = await supabase
        .from('kyc_verifications')
        .insert(verificationData);

      if (error) throw error;

    } catch (error) {
      console.error('Advanced verification error:', error);
      throw error;
    }
  },

  getUserKYCInfo: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching KYC info:', error);
      return null;
    }
  },

  verifyNIN: async (userId: string, nin: string, selfieImage: string) => {
    try {
      // Remove the data:image/jpeg;base64 prefix if present
      const formattedSelfie = selfieImage.includes('base64,') 
        ? selfieImage.split('base64,')[1] 
        : selfieImage;

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationType: 'nin',
          data: {
            nin,
            selfie_image: formattedSelfie
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }

      const responseData = await response.json();
      return responseData;

    } catch (error) {
      console.error('NIN verification error:', error);
      throw error;
    }
  },

  verifyBVN: async (userId: string, bvn: string) => {
    try {
      // Check existing verification
      const { data: existingVerification } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!existingVerification || existingVerification.level < 1) {
        throw new Error('Please complete NIN verification first');
      }

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationType: 'bvn',
          data: { bvn }
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'BVN verification failed');
      }

      // Update verification status
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          level: 2,
          verification_type: 'intermediate',
          verification_data: {
            ...existingVerification.verification_data,
            bvn,
            bvn_verified: responseData.entity?.verified || false
          }
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to update verification status');
      }

      return responseData;
    } catch (error) {
      console.error('BVN verification error:', error);
      throw error;
    }
  },

  getKYCInfo: async (userId: string): Promise<KYCInfo> => {
    const verification = await KYCService.getUserKYCInfo(userId);
    
    if (!verification) {
      return {
        status: 'pending',
        currentTier: 'unverified',
        updatedAt: new Date().toISOString()
      };
    }

    const tierMap = {
      1: 'tier1',
      2: 'tier2',
      3: 'tier3'
    } as const;

    const currentTier = tierMap[verification.level as keyof typeof tierMap] || 'unverified';

    return {
      status: verification.status === 'verified' ? 'approved' : verification.status || 'pending',
      currentTier,
      updatedAt: verification.updated_at
    };
  },

  isEligibleForTrade: async (userId: string): Promise<EligibilityResponse> => {
    const kycInfo = await KYCService.getUserKYCInfo(userId);
    
    if (!kycInfo) {
      return {
        eligible: false,
        reason: "Please complete KYC verification to start trading"
      };
    }

    // Check if KYC is pending
    if (kycInfo.status === 'pending') {
      return {
        eligible: false,
        reason: "Your KYC verification is pending. Please wait for approval."
      };
    }

    // Check if KYC is rejected
    if (kycInfo.status === 'rejected') {
      return {
        eligible: false,
        reason: "Your KYC verification was rejected. Please submit again."
      };
    }

    // Check minimum tier requirement (at least basic/tier1)
    if (kycInfo.level === 0) {
      return {
        eligible: false,
        reason: "Please complete at least basic verification to start trading"
      };
    }

    return {
      eligible: true
    };
  }
};