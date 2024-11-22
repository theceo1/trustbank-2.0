import { createContext, useContext, useState, ReactNode } from 'react';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';

interface TradeContextType {
  currentTrade: UnifiedTradeService.TradeDetails | null;
  setCurrentTrade: (trade: UnifiedTradeService.TradeDetails | null) => void;
  tradeStep: 'input' | 'confirm' | 'payment' | 'complete';
  setTradeStep: (step: 'input' | 'confirm' | 'payment' | 'complete') => void;
  resetTrade: () => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [currentTrade, setCurrentTrade] = useState<UnifiedTradeService.TradeDetails | null>(null);
  const [tradeStep, setTradeStep] = useState<'input' | 'confirm' | 'payment' | 'complete'>('input');

  const resetTrade = () => {
    setCurrentTrade(null);
    setTradeStep('input');
  };

  return (
    <TradeContext.Provider value={{
      currentTrade,
      setCurrentTrade,
      tradeStep,
      setTradeStep,
      resetTrade
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};