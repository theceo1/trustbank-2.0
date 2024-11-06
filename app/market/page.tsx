"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Search,
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Coins
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCryptoWebSocket } from "@/hooks/use-crypto-websocket";
import { MarketStatCard } from "@/app/components/market/MarketStatCard";
import { PriceChart } from "@/app/components/market/PriceChart";
import { CryptoList } from "@/app/components/market/CryptoList";
import { TimeframeSelector } from "@/app/components/market/TimeframeSelector";
import { CurrencySelector } from "@/app/components/market/CurrencySelector";
import { CurrentPrice } from "@/app/components/market/CurrentPrice";
import { PriceChangeIndicator } from "@/app/components/market/PriceChangeIndicator";
import { ChartData, CryptoData } from "@/app/types/market";

const TIMEFRAMES = ['1H', '24H', '7D', '30D', 'ALL'];
const CURRENCIES = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT'];


export default function MarketPage() {
  const [activeTimeframe, setActiveTimeframe] = useState('24H');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const { prices, isConnected } = useCryptoWebSocket();
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    marketCapChange: 0
  });

  useEffect(() => {
    console.log('API connected:', isConnected);
    console.log('Current prices:', prices);
  }, [isConnected, prices]);

  const updateChartData = useCallback(() => {
    setChartData((prevData) => {
      const newDataPoint: ChartData = {
        timestamp: Date.now(),
        price: prices['ETHUSDT'] || prevData[prevData.length - 1]?.price || 0,
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
      price: 1800 + Math.random() * 100,
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

  // Update current price and price change when prices update
  useEffect(() => {
    if (prices[`${selectedCrypto}USDT`]) {
      setCurrentPrice(prices[`${selectedCrypto}USDT`]);
      // Calculate 24h change
      const previousPrice = chartData[0]?.price || 0;
      const change = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
      setPriceChange(change);
    }
  }, [prices, selectedCrypto, chartData, currentPrice]);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const response = await fetch('/api/market-stats');
        const data = await response.json();
        setMarketStats({
          totalMarketCap: data.total_market_cap,
          totalVolume: data.total_volume,
          btcDominance: data.btc_dominance,
          marketCapChange: data.market_cap_change_percentage_24h
        });
      } catch (error) {
        console.error('Error fetching market stats:', error);
      }
    };

    fetchMarketStats();
    const interval = setInterval(fetchMarketStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Update the fetchHistoricalData function
  const fetchHistoricalData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/crypto/history?symbol=${selectedCrypto}&timeframe=${activeTimeframe}`
      );
      if (!response.ok) throw new Error('Failed to fetch historical data');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Ensure data is properly formatted
        const formattedData = data.map(item => ({
          timestamp: Number(item.timestamp),
          price: Number(item.price)
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Set some dummy data if the API fails
      const dummyData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: Date.now() - (23 - i) * 3600000,
        price: 2000 + Math.random() * 100
      }));
      setChartData(dummyData);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCrypto, activeTimeframe]);

  // Add this useEffect to fetch historical data when currency or timeframe changes
  useEffect(() => {
    fetchHistoricalData();
  }, [selectedCrypto, activeTimeframe, fetchHistoricalData]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 mt-16">
      Market Overview 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MarketStatCard
          title="Total Market Cap"
          value={`$${(marketStats.totalMarketCap / 1e12).toFixed(2)}T`}
          change={marketStats.marketCapChange}
          icon={<Activity className="h-4 w-4" />}
        />
        <MarketStatCard
          title="24h Volume"
          value={`$${(marketStats.totalVolume / 1e9).toFixed(2)}B`}
          change={marketStats.marketCapChange}
          icon={<BarChart2 className="h-4 w-4" />}
        />
        <MarketStatCard
          title="BTC Dominance"
          value={`${marketStats.btcDominance.toFixed(2)}%`}
          change={0}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MarketStatCard
          title="Active Cryptocurrencies"
          value="500+"
          change={0}
          icon={<Coins className="h-4 w-4" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {selectedCrypto}/USD
                  <PriceChangeIndicator change={priceChange} />
                </CardTitle>
                <CurrentPrice price={currentPrice} />
              </div>
              <CurrencySelector 
                currencies={CURRENCIES}
                selected={selectedCrypto}
                onSelect={setSelectedCrypto}
              />
            </CardHeader>
            <CardContent>
              <TimeframeSelector 
                timeframes={TIMEFRAMES}
                active={activeTimeframe}
                onChange={setActiveTimeframe}
              />
              <PriceChart 
                data={chartData}
                height={400}
                timeFrame={activeTimeframe}
              />
            </CardContent>
          </Card>
        </div>

        {/* Market Stats Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Market Stats</CardTitle>
              <div className="relative">
                <Input 
                  placeholder="Search coins..."
                  className="max-w-[200px] pl-8"
                />
                <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CryptoList 
                data={cryptoData}
                isLoading={isLoading}
                limit={5}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
