"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { formatPercentage } from '@/app/lib/utils/format';

interface MarketStatsProps {
  currency?: string;
  className?: string;
}

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: string;
}

export function MarketStats({ currency = 'btc', className }: MarketStatsProps) {
  const [data, setData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`/api/market/${currency}`);
        const newData = await response.json();
        setData(newData);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [currency]);

  return (
    <div className={className}>
      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-0 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {/* Price */}
          <StatItem
            label="Current Price"
            isLoading={isLoading}
            value={
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {data ? formatCurrency(data.price) : '-'}
                </span>
                {data && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm ${data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {data.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </motion.span>
                )}
              </div>
            }
          />

          {/* 24h Change */}
          <StatItem
            label="24h Change"
            isLoading={isLoading}
            value={
              <AnimatePresence mode="wait">
                <motion.span
                  key={data?.change24h}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-xl font-bold ${data?.change24h && data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {data ? formatPercentage(data.change24h) : '-'}
                </motion.span>
              </AnimatePresence>
            }
          />

          {/* 24h Volume */}
          <StatItem
            label="24h Volume"
            isLoading={isLoading}
            value={
              <span className="text-xl font-bold">
                {data ? formatCurrency(data.volume24h, 'NGN') : '-'}
              </span>
            }
          />

          {/* Quick Trade */}
          <div className="hidden md:flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg 
                         flex items-center gap-2 transition-colors duration-200"
            >
              Quick Trade
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatItem({ label, value, isLoading }: { label: string; value: React.ReactNode; isLoading: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        value
      )}
    </div>
  );
}