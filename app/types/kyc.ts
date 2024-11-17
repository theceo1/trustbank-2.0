export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  status: KYCStatus;
  created_at: string;
  updated_at: string;
}

export interface KYCLevel {
  level: number;
  name: string;
  daily_limit: number;
  monthly_limit: number;
  annual_limit: number;
  requirements: string[];
}