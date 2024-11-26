"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TradePreview } from './TradePreview';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentFlowController } from '../lib/paymentFlowController';
import { useToast } from '@/hooks/use-toast';
import { TradeDetails, TradeType } from '@/app/types/trade';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { useKYC } from '@/app/hooks/use-kyc';
import { handleError } from '@/app/lib/utils/errorHandler';

export function TradeForm() {
  const { user } = useUser();
  const { checkKYCStatus } = useKYC();
  const router = useRouter();
  const { toast } = useToast();
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [cryptoCurrency, setCryptoCurrency] = useState('btc');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wallet');
  const [rate, setRate] = useState<{ rate: number; total: number } | null>(null);
  
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<TradeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTradeSubmit = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const isEligible = await checkKYCAndProceed();
      if (!isEligible) return;

      const tradeDetails = {
        user_id: user.id,
        type: tradeType,
        currency: cryptoCurrency,
        amount: Number(amount),
        rate: rate!.rate,
        total: rate!.total,
        fees: {
          service: Number(amount) * 0.01,
          network: 0.0005
        },
        paymentMethod: selectedPaymentMethod
      };

      setShowTradeDetails(true);
      setPendingTrade(tradeDetails as TradeDetails);
    } catch (error) {
      handleError(error, 'Failed to prepare trade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradeConfirm = async () => {
    if (!pendingTrade) return;
    
    try {
      setIsLoading(true);
      const trade = await UnifiedTradeService.createTrade(pendingTrade);
      const paymentFlow = await PaymentFlowController.initiate(trade);

      if (paymentFlow.type === 'external') {
        window.location.href = paymentFlow.redirect;
      } else {
        router.push(paymentFlow.redirect);
      }
    } catch (error) {
      handleError(error, 'Failed to process trade');
    } finally {
      setIsLoading(false);
      setShowTradeDetails(false);
    }
  };

  const checkKYCAndProceed = async (): Promise<boolean> => {
    const kycStatus = await checkKYCStatus();
    
    if (!kycStatus) {
      toast({
        id: "kyc-required",
        title: "KYC Required",
        description: "Please complete your KYC verification to proceed",
        variant: "destructive"
      });
      router.push('/kyc');
      return false;
    }
    
    return true;
  };

  return (
    <>
      {/* Luxury Trade Type Selection */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 via-blue-100/20 to-violet-100/20 dark:from-emerald-900/20 dark:via-blue-900/20 dark:to-violet-900/20 rounded-2xl blur-2xl" />
        <div className="relative grid grid-cols-2 gap-3 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
          {['buy', 'sell'].map((type) => (
            <Button
              key={type}
              variant={tradeType === type ? 'default' : 'ghost'}
              onClick={() => setTradeType(type as 'buy' | 'sell')}
              className={cn(
                "h-16 text-base font-medium rounded-xl transition-all duration-300",
                tradeType === type && "bg-gradient-to-br from-primary to-primary/90 text-white shadow-xl"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Crypto
            </Button>
          ))}
        </div>
      </div>

      {/* Amount Input with Currency Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Enter Amount
        </Label>
        <div className="relative group">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-16 text-lg font-medium pl-6 pr-24 rounded-xl border-2 transition-all duration-200 
                     group-hover:border-primary/50 focus:border-primary shadow-sm"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
            {tradeType === 'buy' ? 'NGN' : cryptoCurrency.toUpperCase()}
          </span>
        </div>
      </div>

      <TradePreview
        isOpen={showTradeDetails}
        tradeDetails={pendingTrade as TradeDetails}
        onConfirm={handleTradeConfirm}
        onCancel={() => setShowTradeDetails(false)}
        isLoading={isLoading}
      />
    </>
  );
}