// app/hooks/use-crypto-websocket.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cryptoWebSocket } from '@/app/lib/websocket';
import { WebSocketState } from '@/app/types/websocket';

export function useCryptoWebSocket(symbols: string[] = []) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    prices: {},
    lastUpdate: Date.now(),
    error: null
  });

  const symbolsKey = useMemo(() => symbols.join(','), [symbols]);

  const handleSubscribe = useCallback(() => {
    if (symbols.length > 0) {
      cryptoWebSocket.subscribe(symbols);
    }
  }, [symbols]);

  const handleUnsubscribe = useCallback(() => {
    if (symbols.length > 0) {
      cryptoWebSocket.unsubscribe(symbols);
    }
  }, [symbols]);

  useEffect(() => {
    const unsubscribe = cryptoWebSocket.onStateChange(setState);
    handleSubscribe();

    return () => {
      handleUnsubscribe();
      unsubscribe();
    };
  }, [symbolsKey, handleSubscribe, handleUnsubscribe]);

  return state;
}