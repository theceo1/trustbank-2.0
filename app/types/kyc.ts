export type KYCStatus = 'pending' | 'verified' | 'rejected' | 'unverified';

export interface KYCVerification {
  id: string;
  user_id: string | null;
  status: KYCStatus | null;
  level: number | null;
  verification_type: string | null;
  verification_id: string | null;
  verification_data: Record<string, any> | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  status: KYCStatus;
  verification_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface KYCLevel {
  level: number;
  name: string;
  daily_limit: number;
  monthly_limit: number;
  requirements: string[];
  verification_types: string[];
  max_transaction_amount: number;
}

export interface KYCInfo {
  status: KYCStatus;
  currentTier: string;
  completedRequirements: string[];
  limits: {
    daily: number;
    monthly: number;
  };
}