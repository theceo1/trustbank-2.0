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
      // In a real application, you would fetch this data from an API
      const dummyPrices: PriceData = {
        BTC: 30000 + Math.random() * 1000,
        ETH: 2000 + Math.random() * 100,
        ADA: 1.2 + Math.random() * 0.1,
      };
      setPrices(dummyPrices);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 2, y: 0 }}
      transition={{ duration: 1.5 }}
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
