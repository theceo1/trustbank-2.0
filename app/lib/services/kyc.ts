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

  getUserKYCInfo: async (userId: string): Promise<KYCVerification | null> => {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  verifyNIN: async (userId: string, nin: string, selfieImage: string) => {
    // Convert base64 string to blob
    const base64Response = await fetch(selfieImage);
    const blob = await base64Response.blob();
    
    const formData = new FormData();
    formData.append('nin', nin);
    formData.append('selfie', blob, 'selfie.jpg');

    const response = await fetch('/api/kyc/verify-nin', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }

    return response.json();
  },

  getKYCInfo: async (userId: string): Promise<KYCInfo> => {
    const verification = await KYCService.getUserKYCInfo(userId);
    
    if (!verification) {
      return {
        status: 'unverified',
        currentTier: 'unverified',
        completedRequirements: [],
        limits: {
          daily: 0,
          monthly: 0
        }
      };
    }

    const tierMap = {
      1: 'tier1',
      2: 'tier2',
      3: 'tier3'
    } as const;

    const currentTier = tierMap[verification.level as keyof typeof tierMap] || 'unverified';
    const tier = KYC_TIERS[currentTier];

    return {
      status: verification.status || 'pending',
      currentTier,
      completedRequirements: verification.verification_data?.completedRequirements || [],
      limits: {
        daily: tier.dailyLimit,
        monthly: tier.monthlyLimit
      }
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