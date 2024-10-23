import { useState, useEffect } from 'react';

const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd';

export function useCryptoWebSocket() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setPrices({
          BTCUSDT: data.bitcoin.usd,
          ETHUSDT: data.ethereum.usd,
          USDTUSDT: data.tether.usd
        });
        setIsConnected(true);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setIsConnected(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { prices, isConnected };
}
