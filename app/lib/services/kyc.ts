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

  static async getKYCStatus(userId: string) {
    const { data, error } = await this.supabase
      .from('kyc_status_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getKYCInfo(userId: string): Promise<KYCInfo> {
    const { data, error } = await supabase
      .from('profiles')
      .select('kyc_tier, kyc_status, kyc_documents')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      currentTier: data.kyc_tier || 'unverified',
      status: data.kyc_status || 'pending',
      documents: data.kyc_documents || {}
    };
  }
}