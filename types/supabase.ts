// Supabase types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          full_name: string | null
          is_verified: boolean
          referral_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
        }
        Update: {
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
        }
      }
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          total_deposits: number;
          total_withdrawals: number;
          pending_balance: number;
          currency: string;
          last_transaction_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          fiat_amount: number;
          fiat_currency: string;
          crypto_amount?: number;
          crypto_currency?: string;
        };
      };
    }
  }
}
