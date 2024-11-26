import { formatCurrency } from '@/app/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineChart } from '@/app/components/ui/charts';
import { MetricCard } from '@/app/components/ui/metric-card';
import { useTradeMetrics } from '@/app/hooks/useTradeMetrics';
import { TradeAnalytics } from '@/app/lib/services/analytics/TradeAnalytics';

export function TradeDashboard({ userId }: { userId: string }) {
  const { data, isLoading } = useTradeMetrics(userId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="col-span-full">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Trading Performance</h2>
        </CardHeader>
        <CardContent>
          <LineChart 
            data={data?.volumeHistory} 
            className="h-[300px]"
            gradient
          />
        </CardContent>
      </Card>

      <MetricCard
        title="Success Rate"
        value={`${data?.successRate}%`}
        trend={data?.successRateTrend}
        icon="chart-up"
      />

      <MetricCard
        title="Total Volume"
        value={formatCurrency(data?.totalVolume)}
        trend={data?.volumeTrend}
        icon="dollar-sign"
      />

      <MetricCard
        title="Average Trade"
        value={formatCurrency(data?.averageTradeSize)}
        trend={data?.sizeTrend}
        icon="trending-up"
      />
    </div>
  );
}