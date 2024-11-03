// app/components/calculator/MarketInsights.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from '@/app/hooks/use-media-query';
import { CryptoIcons } from '@/app/components/icons/CryptoIcons';

interface CryptoPrice {
  current_price: number;
  price_change_percentage_24h: number;
}

const SUPPORTED_CURRENCIES = ['bitcoin', 'ethereum', 'tether', 'binancecoin'];

export default function MarketInsights() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/crypto?endpoint=/coins/markets?vs_currency=usd&ids=${SUPPORTED_CURRENCIES.join(',')}&order=market_cap_desc`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      const formattedPrices = data.reduce((acc: Record<string, CryptoPrice>, coin: any) => {
        if (coin && coin.symbol && typeof coin.current_price === 'number') {
          acc[coin.symbol.toUpperCase()] = {
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h || 0
          };
        }
        return acc;
      }, {});

      setPrices(formattedPrices);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setPrices({}); // Reset prices on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <Card className={`backdrop-blur-sm border-2 ${
      isMobile ? 'mt-4 rounded-none border-x-0' : 'rounded-lg'
    }`}>
      <CardHeader className={isMobile ? 'px-4 py-3' : 'p-6'}>
        <CardTitle>Market Insights</CardTitle>
        <CardDescription>Live market data and trends</CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? 'px-4 pb-4' : 'p-6'}>
        <div className="space-y-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))
          ) : (
            Object.entries(prices)
              .slice(0, 4)
              .map(([symbol, data]) => (
                <motion.div
                  key={symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {CryptoIcons[symbol as keyof typeof CryptoIcons] && 
                      React.createElement(CryptoIcons[symbol as keyof typeof CryptoIcons])}
                    <span className="font-medium">{symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${data.current_price.toLocaleString()}</div>
                    <div className={`text-sm flex items-center ${
                      data.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.price_change_percentage_24h >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(data.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}