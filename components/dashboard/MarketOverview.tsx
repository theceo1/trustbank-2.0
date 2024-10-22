"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CoinData {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function MarketOverview({ itemsPerPage = 3 }) {
  const [marketData, setMarketData] = useState<CoinData[]>([]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchMarketData();
  }, []);

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
                <span>{coin.name}</span>
                <div>
                  <span className="mr-2">${coin.current_price.toLocaleString()}</span>
                  <span className={coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}>
                    {coin.price_change_percentage_24h > 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
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
