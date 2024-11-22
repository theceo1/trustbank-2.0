"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { ArrowRight } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { KYCService } from "@/app/lib/services/kyc";
import { WalletService } from '@/app/lib/services/wallet';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { PaymentMethodType } from '@/app/types/payment';
import { WalletBalance } from '@/app/types/market';
import { KYCInfo } from '@/app/types/kyc';
import { ErrorBoundary } from "../ErrorBoundary";
import { QuidaxService } from "@/app/lib/services/quidax";
import { TradeRateRequest, UnifiedTradeParams } from "@/app/types/trade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/app/components/ui/spinner";
import { formatCurrency } from "@/app/lib/utils";
import { TradeDetailsModal } from "./TradeDetailsModal";

// Constants
const SUPPORTED_CRYPTOCURRENCIES = [
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'usdt', name: 'USDT' },
  { symbol: 'usdc', name: 'USDC' }
];

export default function Trade() {
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<KYCInfo | null>(null);
  const [isKYCLoading, setIsKYCLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [cryptoCurrency, setCryptoCurrency] = useState('btc');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState<{ rate: number; total: number } | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!user) return;
      try {
        const kycInfo = await KYCService.getKYCInfo(user.id);
        setKycStatus(kycInfo);
      } catch (error) {
        console.error('Failed to fetch KYC status:', error);
      } finally {
        setIsKYCLoading(false);
      }
    };

    checkKYCStatus();
  }, [user]);

  if (isKYCLoading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  if (!kycStatus?.currentTier || kycStatus.currentTier === 'unverified') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">KYC Required</h2>
        <p className="mb-4">Please complete KYC verification to start trading.</p>
        <Button onClick={() => router.push('/profile/kyc')}>
          Complete Verification
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TradeContent />
    </ErrorBoundary>
  );
}

function TradeContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [cryptoCurrency, setCryptoCurrency] = useState('btc');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState<{ rate: number; total: number } | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  useEffect(() => {
    const fetchRate = async () => {
      if (!amount || Number(amount) <= 0) return;
      
      try {
        const rateParams: TradeRateRequest = {
          amount: Number(amount),
          currency: cryptoCurrency,
          type: tradeType
        };
        
        const rateData = await QuidaxService.getRate(rateParams);
        setRate(rateData);
      } catch (error) {
        handleError(error, 'Failed to fetch rate');
      }
    };

    const timer = setTimeout(fetchRate, 500);
    return () => clearTimeout(timer);
  }, [amount, cryptoCurrency, tradeType, handleError]);

  const checkKYCAndProceed = async (): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const { eligible, reason } = await KYCService.isEligibleForTrade(user.id);
      if (!eligible) {
        toast({
          title: "KYC Required",
          description: reason,
          variant: "destructive",
        });
        router.push('/profile/kyc');
        return false;
      }
      return true;
    } catch (error) {
      handleError(error, 'KYC check failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!user || !rate) return;

    try {
      setIsLoading(true);
      setShowTradeDetails(false);

      // Check KYC status first
      const isEligible = await checkKYCAndProceed();
      if (!isEligible) {
        setShowTradeDetails(false);
        return;
      }

      const tradeParams = {
        userId: user.id,
        type: tradeType,
        currency: cryptoCurrency,
        amount: Number(amount),
        rate: rate.rate,
        paymentMethod: selectedPaymentMethod
      };

      const response = await fetch('/api/trades/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create trade');
      }

      const trade = await response.json();

      // Handle payment method specific logic
      if (selectedPaymentMethod === 'wallet') {
        await handleWalletPayment(trade);
      } else if (trade.payment_url) {
        window.location.href = trade.payment_url;
      } else {
        router.push(`/transaction/${trade.id}`);
      }
    } catch (error: any) {
      handleError(error, 'Unable to process trade');
      setShowTradeDetails(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletPayment = async (trade: UnifiedTradeService.TradeDetails) => {
    try {
      await WalletService.transferToExchange(user!.id, Number(amount));
      await UnifiedTradeService.updateTradeStatus(trade.id, 'completed');
      router.push(`/transaction/${trade.id}`);
    } catch (error) {
      handleError(error, 'Unable to process wallet payment');
      throw error;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant={tradeType === 'buy' ? 'default' : 'outline'}
          onClick={() => setTradeType('buy')}
        >
          Buy
        </Button>
        <Button
          variant={tradeType === 'sell' ? 'default' : 'outline'}
          onClick={() => setTradeType('sell')}
        >
          Sell
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        
        <Select                                                                                                                         
          value={cryptoCurrency}
          onValueChange={setCryptoCurrency}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CRYPTOCURRENCIES.map((currency) => (
              <SelectItem key={currency.symbol} value={currency.symbol}>
                {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedPaymentMethod}
          onValueChange={(value: PaymentMethodType) => setSelectedPaymentMethod(value)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
          </SelectContent>
        </Select>

        {rate && (
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Rate:</span>
              <span>{formatCurrency(rate.rate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span>{formatCurrency(rate.total)}</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleTrade}
          disabled={!amount || Number(amount) <= 0 || isLoading}
        >
          {isLoading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${cryptoCurrency.toUpperCase()}`}
        </Button>
      </div>

      <TradeDetailsModal
        isOpen={showTradeDetails}
        onClose={() => setShowTradeDetails(false)}
        onProceed={handleTrade}
        tradeDetails={{
          type: tradeType,
          currency: cryptoCurrency,
          amount: Number(amount),
          rate: rate?.rate || 0,
          total: rate?.total || 0,
          paymentMethod: selectedPaymentMethod,
          fees: {
            service: (rate?.total || 0) * 0.01,
            network: 1000
          }
        }}
      />
    </div>
  );
}