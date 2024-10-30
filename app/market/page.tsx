"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCryptoWebSocket } from "@/hooks/use-crypto-websocket";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format } from "date-fns";

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
const TIMEFRAMES = ['1H', '24H', '7D', '30D'];

export default function MarketPage() {
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
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

  const fetchCryptoData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false&x_cg_demo_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCryptoData(data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
  }, []);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  // Access price data
  const btcPrice = prices.BTCUSDT;
  const btcChange = prices.BTCUSDT_24h_change;
  const btcPrevPrice = prices.BTCUSDT_prev;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview Section */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {selectedCrypto}/USD
                  </CardTitle>
                  <span className={`text-lg font-semibold ${
                    prices[`${selectedCrypto}USDT`] > prices[`${selectedCrypto}USDT_prev`] 
                    ? 'text-green-500' 
                    : 'text-red-500'
                  }`}>
                    ${prices[`${selectedCrypto}USDT`]?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <span className={prices[`${selectedCrypto}USDT_24h_change`] > 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                  }>
                    {prices[`${selectedCrypto}USDT_24h_change`]?.toFixed(2)}%
                  </span>
                  {prices[`${selectedCrypto}USDT_24h_change`] > 0 
                    ? <TrendingUp className="w-4 h-4 text-green-500" />
                    : <TrendingDown className="w-4 h-4 text-red-500" />
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTimeframe} onValueChange={setActiveTimeframe}>
                  <TabsList className="mb-4">
                    {TIMEFRAMES.map((timeframe) => (
                      <TabsTrigger key={timeframe} value={timeframe}>
                        {timeframe}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={(timestamp) => format(timestamp, 'HH:mm')}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          stroke="#6b7280"
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                          labelFormatter={(label) => format(label, 'HH:mm:ss')}
                          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                        />
                        <Area 
                          type="monotone"
                          dataKey="eth"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Market Stats Section */}
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
}
