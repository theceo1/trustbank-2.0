import { useQuery } from '@tanstack/react-query';
import { TradeAnalytics } from '@/app/lib/services/analytics/TradeAnalytics';

export function useTradeMetrics(userId: string) {
  return useQuery({
    queryKey: ['tradeMetrics', userId],
    queryFn: async () => {
      const analytics = new TradeAnalytics();
      return analytics.getUserMetrics(userId);
    }
  });
}