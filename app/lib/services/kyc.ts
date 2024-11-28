// app/lib/services/kyc.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { KYCVerification, KYCStatus } from '@/app/types/kyc';
import supabase from "@/lib/supabase/client";
import { KYCInfo } from "@/app/types/kyc";

export class KYCService {
  private static supabase = createClientComponentClient();

  static async submitVerification(
    userId: string,
    type: KYCVerification['verification_type'],
    data: any
  ) {
    try {
      const verificationData = {
        user_id: userId,
        verification_type: type,
        status: 'pending' as KYCStatus,
        verification_data: data,
        attempt_count: 1,
        last_attempt_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('kyc_status_tracking')
        .insert(verificationData);

      if (error) throw error;

    } catch (error) {
      console.error(`${type} verification error:`, error);
      throw error;
    }
  }

  static async getKYCStatus(userId: string): Promise<{ isVerified: boolean }> {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('KYC fetch error:', error);
        return { isVerified: false };
      }

      return { isVerified: !!data?.verified_at };
    } catch (error) {
      console.error('KYC fetch error:', error);
      return { isVerified: false };
    }
  }

  static async getKYCInfo(userId: string): Promise<KYCInfo> {
    try {
      // First check if the columns exist
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('KYC fetch error:', profileError);
        return {
          currentTier: 'unverified',
          status: 'pending',
          documents: {}
        };
      }

      // Return default values if columns don't exist
      return {
        currentTier: profileData?.kyc_tier || 'unverified',
        status: profileData?.kyc_status || 'pending',
        documents: profileData?.kyc_documents || {}
      };
    } catch (error) {
      console.error('KYC service error:', error);
      return {
        currentTier: 'unverified',
        status: 'pending',
        documents: {}
      };
    }
  }
}