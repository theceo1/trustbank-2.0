export interface Database {
    public: {
      Tables: {
        trades: {
          Row: {
            id: string;
            user_id: string;
            type: 'buy' | 'sell';
            currency: string;
            amount: number;
            rate: number;
            status: 'pending' | 'completed' | 'failed';
            payment_method: string;
            payment_url?: string;
            quidax_reference?: string;
            created_at: string;
          };
          Insert: Omit<Database['public']['Tables']['trades']['Row'], 'id' | 'created_at'>;
          Update: Partial<Database['public']['Tables']['trades']['Row']>;
        };
      };
    };
  }