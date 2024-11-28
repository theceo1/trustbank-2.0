export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type TransactionType = 'buy' | 'sell' | 'deposit' | 'withdrawal';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface ReferralTransaction extends Transaction {
  referrer_id: string;
  commission: number;
  commission_currency: string;
}

export interface TransactionFilters {
  currency?: string;
  limit?: number;
  status: string;
  dateRange: string;
}