import { format, parseISO } from 'date-fns';
import {
  calculateConversionRate,
  calculateAverageCommission,
  groupByTier,
  getTopReferrers,
  calculateGrowth,
  calculateRetention,
  calculateSuccessRate,
  groupByStatus
} from './calculations';
import { TimeframeType } from '../hooks/useAnalyticsData';

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const processTimeSeriesData = (
  data: any[],
  timeframe: TimeframeType,
  dateField: string,
  valueField: string = 'count'
): { date: string; [key: string]: string | number }[] => {
  if (!data.length) return [];

  const groupedData = data.reduce((acc, item) => {
    const date = format(parseISO(item[dateField]), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { [valueField]: 0 };
    }
    acc[date][valueField] += valueField === 'count' ? 1 : (item[valueField] || 0);
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(groupedData).map(([date, values]) => ({
    date,
    ...values
  }));
};

export const processReferralData = (
  data: any[],
  timeframe: TimeframeType
) => ({
  totalReferrals: data.length,
  activeReferrers: new Set(data.map(ref => ref.referrer_id)).size,
  conversionRate: calculateConversionRate(data),
  averageCommission: calculateAverageCommission(data),
  referralsByTier: groupByTier(data),
  topReferrers: getTopReferrers(data),
  referralsByTime: processTimeSeriesData(data, timeframe, 'created_at')
});

export const processUserData = (data: any[], timeframe: TimeframeType) => {
  const usersByTime = processTimeSeriesData(data, timeframe, 'created_at', 'count');
  return {
    totalUsers: data.length,
    activeUsers: data.filter(user => user.last_login_at).length,
    growth: calculateGrowth(usersByTime),
    retention: calculateRetention(data),
    usersByTime
  };
};

export const processTransactionData = (data: any[], timeframe: string) => {
  const total = data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return {
    totalTransactions: data.length,
    totalVolume: total,
    averageTransaction: data.length ? total / data.length : 0,
    successRate: calculateSuccessRate(data),
    transactionsByStatus: groupByStatus(data),
    transactionsByTime: processTimeSeriesData(data, timeframe, 'created_at', 'amount')
  };
};