"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MarketOverviewSkeleton } from "@/app/components/skeletons";
import { CryptoData } from '@/app/types/market';
import Image from 'next/image';

export default function MarketOverview({ itemsPerPage = 3 }) {
  const [marketData, setMarketData] = useState<CryptoData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/market-data');
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setError('Failed to load market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (isLoading) {
    return <MarketOverviewSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {marketData.slice(0, itemsPerPage).map((coin) => (
              <li key={coin.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {coin.image && (
                    <Image 
                      src={coin.image} 
                      alt={coin.name} 
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span>{coin.name}</span>
                </div>
                <div>
                  <span className="mr-2">${coin.current_price.toLocaleString()}</span>
                  <span className={coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}>
                    {coin.price_change_percentage_24h > 0 ? "+" : ""}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}