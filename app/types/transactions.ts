export type TransactionType = 'deposit' | 'withdrawal' | 'trade' | 'transfer' | 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'PENDING' | 'COMPLETED' | 'FAILED';
export type TransactionCurrency = 'NGN' | 'BTC' | 'ETH' | 'USDT';

export interface BaseTransaction {
  id: string;
  user_id: string;
  amount: number;
  status: TransactionStatus;
  created_at: string;
  currency?: TransactionCurrency;
  payment_reference?: string;
}

export interface FiatTransaction extends BaseTransaction {
  type: 'deposit' | 'withdrawal';
  wallet_id: string;
}

export interface CryptoTransaction extends BaseTransaction {
  type: 'buy' | 'sell';
  crypto_amount: number;
  crypto_currency: TransactionCurrency;
  rate: number;
}

export interface ReferralTransaction extends BaseTransaction {
  referrer_id: string;
  referred_id: string;
  referrer: {
    full_name: string;
    email: string;
  };
  referred: {
    full_name: string;
    email: string;
  };
}

export type Transaction = FiatTransaction | CryptoTransaction;