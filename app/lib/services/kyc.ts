import supabase from '@/lib/supabase/client';

export type KYCStatusType = 'pending' | 'verified' | 'rejected' | 'unverified';

export class KYCService {
  static async getUserKYCStatus(userId: string): Promise<KYCStatusType> {
    try {
      const { data, error } = await supabase
        .from('user_kyc')
        .select('status')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.status || 'unverified';
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      return 'unverified';
    }
  }

  static async isEligibleForTrade(userId: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    const status = await this.getUserKYCStatus(userId);
    
    switch (status) {
      case 'verified':
        return { eligible: true };
      case 'pending':
        return { 
          eligible: false, 
          reason: 'Your KYC verification is still pending. Please wait for approval.' 
        };
      case 'rejected':
        return { 
          eligible: false, 
          reason: 'Your KYC verification was rejected. Please submit new documents.' 
        };
      default:
        return { 
          eligible: false, 
          reason: 'Please complete KYC verification before trading.' 
        };
    }
  }
}