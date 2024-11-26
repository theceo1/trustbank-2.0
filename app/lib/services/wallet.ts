import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { TradeDetails } from '@/app/types/trade';

interface PaymentProcessResult {
  reference: string;
  status: 'completed' | 'failed';
}

export class WalletService {
  private static supabase = createClientComponentClient<Database>();

  static async processTradePayment(userId: string, tradeDetails: TradeDetails) {
    try {
      const { data, error } = await this.supabase.rpc('process_wallet_transaction', {
        p_user_id: userId,
        p_type: 'trade_payment',
        p_amount: tradeDetails.total,
        p_currency: tradeDetails.currency,
        p_trade_id: tradeDetails.id,
        p_metadata: {
          trade_type: tradeDetails.type,
          rate: tradeDetails.rate,
          fees: tradeDetails.fees
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Trade payment error:', error);
      throw error;
    }
  }

  static async getTransactionHistory(userId: string, currency?: string) {
    const query = this.supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (currency) {
      query.eq('currency', currency);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getUserBalance(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.balance || 0;
  }

  static async updateBalance(userId: string, amount: number): Promise<void> {
    const { error } = await this.supabase.rpc('update_wallet_balance', {
      p_user_id: userId,
      p_amount: amount
    });

    if (error) throw error;
  }

  static async processPayment(params: {
    amount: number;
    currency: string;
    tradeId: string;
  }): Promise<PaymentProcessResult> {
    try {
      // Process payment logic here
      return {
        reference: `WAL_${params.tradeId}_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      throw error;
    }
  }
}