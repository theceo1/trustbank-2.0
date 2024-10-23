"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCryptoWebSocket } from "@/hooks/use-crypto-websocket";
import { motion } from "framer-motion";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface ChartData {
  timestamp: number;
  eth: number;
}

const TOP_CRYPTOS = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'cardano', 'solana'];

export default function MarketPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { prices, isConnected } = useCryptoWebSocket();

  useEffect(() => {
    console.log('API connected:', isConnected);
    console.log('Current prices:', prices);
  }, [isConnected, prices]);

  const updateChartData = useCallback(() => {
    setChartData((prevData) => {
      const newDataPoint: ChartData = {
        timestamp: Date.now(),
        eth: prices['ETHUSDT'] || prevData[prevData.length - 1]?.eth || 0,
      };
      console.log('Updating chart data:', newDataPoint);
      return [...prevData.slice(-99), newDataPoint];
    });
  }, [prices]);

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      updateChartData();
    }
  }, [prices, updateChartData]);

  useEffect(() => {
    const initialData: ChartData[] = Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() - (99 - i) * 60000,
      eth: 1800 + Math.random() * 100,
    }));
    setChartData(initialData);
  }, []);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false`
      );
      const data = await response.json();
      setCryptoData(data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen pt-24">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-lg font-bold mb-4 text-green-600"
      >
        Cryptocurrency Market
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8"
      >
        {cryptoData.map((crypto) => (
          <Card key={crypto.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{crypto.name} ({crypto.symbol.toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg sm:text-xl font-bold">${crypto.current_price.toFixed(2)}</p>
              <p className={`text-sm ${crypto.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="min-h-[300px] text-sm">
          <CardHeader>
            <CardTitle>Live ETH Price Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height={400} className="border border-red-500">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip 
                  labelFormatter={(label) => new Date(label as number).toLocaleString()}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'ETH Price']}
                />
                <Legend />
                <Line type="monotone" dataKey="eth" stroke="#3b82f6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
