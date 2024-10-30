export interface BaseTransaction {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
}

export interface Transaction extends BaseTransaction {
  type: 'deposit' | 'withdrawal' | 'swap' | 'trade' | 'buy' | 'sell';
  crypto_amount?: number;
  crypto_currency?: string;
  fiat_amount?: number;
  fiat_currency?: string;
}