import supabase from '@/lib/supabase/client';
import { KYCDocument, KYCLevel, KYCStatus } from '@/app/types/kyc';

export class KYCService {
  static async getUserKYCStatus(userId: string): Promise<KYCStatus> {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching KYC status:', error);
      return 'unverified';
    }

    return data?.status || 'unverified';
  }

  static async updateUserKYCStatus(
    userId: string, 
    documentType: string, 
    documentNumber: string, 
    status: KYCStatus = 'pending'
  ): Promise<void> {
    const { error } = await supabase
      .from('kyc_documents')
      .insert({
        user_id: userId,
        document_type: documentType,
        document_number: documentNumber,
        status: status,
      });

    if (error) throw error;
  }

  static async determineKYCTier(
    userId: string, 
    documentType: string
  ): Promise<KYCLevel> {
    const verifiedDocs = await this.getUserVerifiedDocuments(userId);
    const { data: levels, error } = await supabase
      .from('kyc_levels')
      .select('*')
      .order('daily_limit', { ascending: true });

    if (error) throw error;

    // Add the current document type to verified documents
    const verifiedTypes = new Set([
      ...verifiedDocs.map(doc => doc.document_type),
      documentType
    ]);

    // Find the highest level where requirements are met
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      const requirements = level.requirements as string[];
      if (requirements.every(req => verifiedTypes.has(req))) {
        return level;
      }
    }

    return levels[0]; // Return base level if no higher tier is matched
  }

  static async getUserKYCLevel(userId: string): Promise<KYCLevel> {
    const status = await this.getUserKYCStatus(userId);
    
    const { data: levels, error } = await supabase
      .from('kyc_levels')
      .select('*')
      .order('daily_limit', { ascending: true });

    if (error) throw error;

    if (status === 'verified') {
      const verifiedDocs = await this.getUserVerifiedDocuments(userId);
      const verifiedTypes = new Set(verifiedDocs.map(doc => doc.document_type));
      
      for (let i = levels.length - 1; i >= 0; i--) {
        const level = levels[i];
        const requirements = level.requirements as string[];
        if (requirements.every(req => verifiedTypes.has(req))) {
          return level;
        }
      }
    }

    return levels[0];
  }

  private static async getUserVerifiedDocuments(userId: string): Promise<KYCDocument[]> {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'verified');

    if (error) throw error;
    return data;
  }

  static async isEligibleForTrade(userId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const status = await this.getUserKYCStatus(userId);
      const kycLevel = await this.getUserKYCLevel(userId);

      switch (status) {
        case 'unverified':
          return {
            eligible: false,
            reason: 'Please complete your KYC verification to trade.'
          };
        case 'pending':
          return {
            eligible: false,
            reason: 'Your KYC verification is pending. Please wait for approval.'
          };
        case 'rejected':
          return {
            eligible: false,
            reason: 'Your KYC verification was rejected. Please submit new documents.'
          };
        case 'verified':
          return {
            eligible: true
          };
        default:
          return {
            eligible: false,
            reason: 'Invalid KYC status. Please contact support.'
          };
      }
    } catch (error) {
      console.error('Error checking trade eligibility:', error);
      return {
        eligible: false,
        reason: 'Unable to verify KYC status. Please try again later.'
      };
    }
  }
}