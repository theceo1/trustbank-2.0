import supabase from '@/lib/supabase/client';
import { TradeDetails, TradeStatus } from '@/app/types/trade';

export class TradeTransaction {
  private static async beginTransaction() {
    await supabase.rpc('begin_transaction');
  }

  private static async commitTransaction() {
    await supabase.rpc('commit_transaction');
  }

  private static async rollbackTransaction() {
    await supabase.rpc('rollback_transaction');
  }

  static async executeTradeWithRollback(
    tradeDetails: TradeDetails,
    operations: Array<() => Promise<void>>
  ): Promise<void> {
    try {
      await this.beginTransaction();

      for (const operation of operations) {
        await operation();
      }

      await this.commitTransaction();
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  static async revertTradeOnFailure(tradeId: string): Promise<void> {
    try {
      const { data: trade } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (!trade) return;

      await this.executeTradeWithRollback(trade as TradeDetails, [
        async () => {
          // Revert wallet balance if necessary
          if (trade.payment_method === 'wallet') {
            await supabase.rpc('revert_wallet_transaction', {
              trade_id: trade.id
            });
          }

          // Update trade status
          await supabase
            .from('trades')
            .update({ status: 'failed' as TradeStatus })
            .eq('id', trade.id);

          // Log the reversion
          await supabase.from('trade_logs').insert({
            trade_id: trade.id,
            action: 'revert',
            details: 'Trade reverted due to failure'
          });
        }
      ]);
    } catch (error) {
      console.error('Failed to revert trade:', error);
      throw error;
    }
  }
}