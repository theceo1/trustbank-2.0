"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { useCryptoWebSocket } from "@/hooks/use-crypto-websocket";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Activity, 
  RefreshCcw, ArrowUpRight, ArrowDownRight,
  Info, DollarSign, BarChart2
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const TIMEFRAMES = ['1H', '24H', '7D', '30D', 'ALL'];
const CURRENCIES = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT'];

export default function MarketPage() {
  const [activeTimeframe, setActiveTimeframe] = useState('24H');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        `/api/crypto?endpoint=/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=false`
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

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen pt-24">
      {/* Market Overview Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crypto Market</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Real-time market data</span>
          {isConnected ? (
            <Badge variant="success" className="ml-2">Live</Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">Disconnected</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      {selectedCrypto}/USD
                      <TooltipProvider>
                        <TooltipUI>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Real-time price data for {selectedCrypto}</p>
                          </TooltipContent>
                        </TooltipUI>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-mono">
                        {prices[`${selectedCrypto}USDT`]?.toFixed(2) || '0.00'}
                      </span>
                      <span className={`flex items-center ${
                        prices[`${selectedCrypto}USDT_24h_change`] > 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {prices[`${selectedCrypto}USDT_24h_change`]?.toFixed(2)}%
                        {prices[`${selectedCrypto}USDT_24h_change`] > 0 
                          ? <ArrowUpRight className="h-4 w-4" />
                          : <ArrowDownRight className="h-4 w-4" />
                        }
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {CURRENCIES.map((currency) => (
                      <Button
                        key={currency}
                        variant={selectedCrypto === currency ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCrypto(currency)}
                      >
                        {currency}
                      </Button>
                    ))}
                  </div>
                </div>
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
                  <div className="h-[500px] w-full">
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
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Market Stats
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fetchCryptoData()}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    ))
                  ) : (
                    cryptoData.map((crypto) => (
                      <motion.div
                        key={crypto.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{crypto.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {crypto.symbol.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">
                            ${crypto.current_price.toFixed(2)}
                          </p>
                          <p className={`text-sm ${
                            crypto.price_change_percentage_24h > 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {crypto.price_change_percentage_24h.toFixed(2)}%
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
