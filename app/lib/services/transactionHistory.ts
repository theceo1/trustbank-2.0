import supabase from '@/lib/supabase/client';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  status: string;
  created_at: string;
}

export class TransactionHistoryService {
  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }
}