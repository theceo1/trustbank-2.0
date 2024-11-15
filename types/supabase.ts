// types/supabase.ts
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
          referred_by: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          email?: string | null
        }
        Update: {
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          email?: string | null
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
          wallet_id: string;
          type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
          amount: number;
          status: 'pending' | 'completed' | 'failed';
          currency: string;
          description?: string;
          payment_method?: string;
          reference?: string;
          external_id?: string;
          fiat_amount?: number;
          fiat_currency?: string;
          crypto_amount?: number;
          crypto_currency?: string;
          rate?: number;
          payment_reference?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Row']>;
      };
      admin_users: {
        Row: {
          id: string
          user_id: string
          is_active: boolean
          role: {
            name: string
            permissions: Record<string, string[]>
          }[]
        }
        Insert: {
          id?: string
          user_id: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          is_active?: boolean
        }
      }
    }
  }
}
