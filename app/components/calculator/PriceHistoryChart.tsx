"use client";

import { useEffect, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/app/hooks/use-media-query';
import type { ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceHistoryChartProps {
  cryptoId: string;
  currency?: string;
}

interface PriceDataPoint {
  x: string;
  y: number;
}

const timeRanges = [
  { label: '24H', value: '1' },
  { label: '7D', value: '7' },
  { label: '30D', value: '30' },
  { label: '90D', value: '90' }
];

export default function PriceHistoryChart({ cryptoId, currency = 'usd' }: PriceHistoryChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchPriceHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/crypto?endpoint=/coins/${cryptoId}/market_chart?vs_currency=usd&days=${timeRange}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      // Initialize empty chart if no data
      if (!data?.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
        setChartData({
          labels: [],
          datasets: [{
            label: `${cryptoId.toUpperCase()} Price`,
            data: [],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
          }]
        });
        return;
      }

      const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
        x: new Date(timestamp).toLocaleDateString(),
        y: price
      }));

      setChartData({
        labels: prices.map((p: PriceDataPoint) => p.x),
        datasets: [{
          label: `${cryptoId.toUpperCase()} Price`,
          data: prices.map((p: PriceDataPoint) => p.y),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        }],
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
      // Set empty chart data on error
      setChartData({
        labels: [],
        datasets: [{
          label: `${cryptoId.toUpperCase()} Price`,
          data: [],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        }]
      });
    } finally {
      setLoading(false);
    }
  }, [cryptoId, timeRange]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${currency.toUpperCase()} ${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        type: 'linear',
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return `${currency?.toUpperCase()} ${value.toFixed(2)}`;
            }
            return value;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Price History</h3>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            {timeRanges.map(({ label, value }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[300px] relative">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {chartData && <Line data={chartData} options={chartOptions} />}
          </motion.div>
        )}
      </div>
    </Card>
  );
}