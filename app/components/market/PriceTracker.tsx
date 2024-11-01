// app/components/market/PriceTracker.tsx

import { useCryptoWebSocket } from '@/app/hooks/use-crypto-websocket';

export function PriceTracker() {
  const { isConnected, prices, error } = useCryptoWebSocket(['btcusdt', 'ethusdt']);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {Object.entries(prices).map(([symbol, data]) => (
        <div key={symbol}>
          <span>{symbol.toUpperCase()}: </span>
          <span>${data.price.toFixed(2)} </span>
          <span className={data.change >= 0 ? 'text-green-500' : 'text-red-500'}>
            ({data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%)
          </span>
        </div>
      ))}
    </div>
  );
}