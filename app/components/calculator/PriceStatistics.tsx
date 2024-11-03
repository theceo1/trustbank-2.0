"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceStatisticsProps {
  cryptoId: string;
  currency?: string;
}

export default function PriceStatistics({ cryptoId, currency = 'usd' }: PriceStatisticsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/crypto?endpoint=/simple/price?ids=${cryptoId}&vs_currencies=${currency}&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data[cryptoId]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [cryptoId, currency]);

  const StatItem = ({ label, value, change }: any) => (
    <div className="flex flex-col space-y-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold">{value}</span>
        {change && (
          <span className={`flex items-center text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        ) : stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatItem
                label="Current Price"
                value={`${currency.toUpperCase()} ${stats[currency].toFixed(2)}`}
                change={stats[`${currency}_24h_change`]}
              />
              <StatItem
                label="24h Volume"
                value={`${currency.toUpperCase()} ${(stats[`${currency}_24h_vol`] || 0).toLocaleString()}`}
              />
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}