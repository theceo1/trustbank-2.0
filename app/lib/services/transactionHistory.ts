// app/lib/services/transactionHistory.ts
import supabase from '@/lib/supabase/client';
import { TradeDetails } from '@/app/types/trade';

export class TransactionHistoryService {
  static async getUserTransactions(userId: string): Promise<TradeDetails[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          id,
          user_id,
          type,
          currency,
          amount,
          rate,
          total,
          quidax_fee,
          platform_fee,
          status,
          payment_method,
          payment_url,
          quidax_reference,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this.mapDbTradeToTradeDetails) || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  static async getTradeDetails(tradeId: string, userId: string): Promise<TradeDetails | null> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching trade details:', error);
      throw error;
    }
  }

  static mapDbTradeToTradeDetails(dbTrade: any): TradeDetails {
    return {
      id: dbTrade.id,
      user_id: dbTrade.user_id,
      type: dbTrade.type,
      currency: dbTrade.currency,
      amount: Number(dbTrade.amount),
      rate: Number(dbTrade.rate),
      total: Number(dbTrade.total),
      fees: {
        service: Number(dbTrade.quidax_fee),
        network: Number(dbTrade.platform_fee)
      },
      status: dbTrade.status,
      paymentMethod: dbTrade.payment_method,
      payment_url: dbTrade.payment_url,
      quidax_reference: dbTrade.quidax_reference,
      createdAt: dbTrade.created_at,
      updatedAt: dbTrade.updated_at
    };
  }
}