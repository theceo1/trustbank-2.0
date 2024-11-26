import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

export class TradeAnalytics {
  private static supabase = createClientComponentClient<Database>();

  static async getTradeMetrics(userId: string, period: 'day' | 'week' | 'month' = 'week') {
    const { data, error } = await this.supabase.rpc('calculate_trade_metrics', {
      p_user_id: userId,
      p_period: period
    });

    if (error) throw error;
    return {
      totalVolume: data.total_volume,
      successRate: data.success_rate,
      averageTradeSize: data.avg_trade_size,
      preferredPaymentMethod: data.preferred_payment,
      growth: data.period_over_period_growth
    };
  }

  async getUserMetrics(userId: string) {
    return {
      totalTrades: 0,
      successRate: 0,
      averageAmount: 0,
      recentTrades: []
    };
  }
}