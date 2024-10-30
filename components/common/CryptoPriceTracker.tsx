"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const cryptos = ["BTC", "ETH", "ADA"];

interface PriceData {
  [key: string]: number;
}

export default function CryptoPriceTracker() {
  const [prices, setPrices] = useState<PriceData>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/crypto-prices');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setPrices(data);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Live Crypto Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {cryptos.map((crypto) => (
              <li key={crypto} className="flex justify-between items-center">
                <span>{crypto}</span>
                <span>${prices[crypto]?.toFixed(2) || "Loading..."}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
