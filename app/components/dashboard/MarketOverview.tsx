"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MarketOverviewSkeleton } from "@/app/components/skeletons";
import { CoinData } from '@/app/types/market';

export default function MarketOverview({ itemsPerPage = 3 }) {
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (isLoading) {
    return <MarketOverviewSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Rest of your market overview content */}
    </motion.div>
  );
}