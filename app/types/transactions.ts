export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
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