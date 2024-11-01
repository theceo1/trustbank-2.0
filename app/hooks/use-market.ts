// app/hooks/use-market.ts

import { useState, useEffect } from 'react';
import { CryptoData, TimeFrame, CryptoHistoricalData } from '@/app/types/market';

export function useMarketData() {
  const [data, setData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/market-data');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const marketData = await response.json();
      setData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every minutes
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

export function useHistoricalData(
  symbol: string,
  timeFrame: TimeFrame
) {
  const [data, setData] = useState<CryptoHistoricalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/historical-data?symbol=${symbol}&timeFrame=${timeFrame}`);
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        const historicalData = await response.json();
        setData(historicalData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, timeFrame]);

  return { data, isLoading, error };
}

export function useCryptoPrice(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/crypto-price?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }
        const data = await response.json();
        setPrice(data.price);
        setPriceChange(data.price_change_24h);
      } catch (error) {
        console.error('Error fetching price:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [symbol]);

  return { price, priceChange, isLoading };
}