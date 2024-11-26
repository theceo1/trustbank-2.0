export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
      Tables: {
        user_profiles: {
          Row: {
            id: string;
            full_name: string | null;
            phone_number: string | null;
            kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
            kyc_level: number;
            trading_limit: number;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id: string;
            full_name?: string | null;
            phone_number?: string | null;
            kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
            kyc_level?: number;
            trading_limit?: number;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            full_name?: string | null;
            phone_number?: string | null;
            kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
            kyc_level?: number;
            trading_limit?: number;
            updated_at?: string;
          };
        };
        trades: {
          Row: {
            id: string;
            user_id: string;
            type: 'buy' | 'sell';
            currency: string;
            amount: number;
            rate: number;
            total: number;
            fees: Json;
            status: 'pending' | 'processing' | 'completed' | 'failed';
            payment_method: 'bank' | 'wallet' | 'card';
            payment_reference: string | null;
            quidax_reference: string | null;
            metadata: Json;
            created_at: string;
            updated_at: string;
          };
          Insert: Omit<Database['public']['Tables']['trades']['Row'], 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<Database['public']['Tables']['trades']['Row'], 'id'>>;
        };
      };
    };
  }