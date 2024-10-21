"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, Bar } from 'recharts';
import { useCryptoWebSocket } from "@/hooks/use-crypto-websocket";
import { motion } from "framer-motion";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const TOP_CRYPTOS = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'cardano', 'solana'];

export default function MarketPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const { prices, isConnected } = useCryptoWebSocket();

  useEffect(() => {
    fetchCryptoData();
    fetchChartData();
  }, []);

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      setCryptoData((prevData) =>
        prevData.map((crypto) => ({
          ...crypto,
          current_price: prices[crypto.symbol.toUpperCase()] || crypto.current_price,
        }))
      );
    }
  }, [prices]);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TOP_CRYPTOS.join(',')}&order=market_cap_desc&sparkline=false`
      );
      const data = await response.json();
      setCryptoData(data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
      );
      const data = await response.json();
      const formattedData = data.prices.map((price: number[], index: number) => ({
        date: new Date(price[0]).toLocaleDateString(),
        price: price[1],
        volume: data.total_volumes[index][1],
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg font-bold mb-4 text-green-600 pt-12"
      >
        Cryptocurrency Market
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.2, duration: 1.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4"
      >
        {cryptoData.map((crypto) => (
          <Card key={crypto.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{crypto.name} ({crypto.symbol.toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold">${crypto.current_price.toFixed(2)}</p>
              <p className={`text-sm ${crypto.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.4, duration: 1.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Bitcoin Price and Volume (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <CartesianGrid stroke="#f5f5f5" />
                <Area type="monotone" dataKey="price" fill="#8884d8" stroke="#8884d8" yAxisId="left" />
                <Bar dataKey="volume" barSize={20} fill="#413ea0" yAxisId="right" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
