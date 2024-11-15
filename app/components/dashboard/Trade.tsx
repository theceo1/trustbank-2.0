"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { CryptoTradeService } from "@/app/lib/services/crypto";
import { useWallet } from "@/app/hooks/useWallet";
import supabase from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { KYCService } from "@/app/lib/services/kyc";
import { PaymentMethodSelector } from "@/app/components/payment/PaymentMethodSelector";
import { PaymentMethodType, PaymentMethodConfig, PAYMENT_METHODS } from '@/app/types/payment';
import TransactionPreview from "@/app/components/trade/TransactionPreview";
import { TransactionLimitService } from '@/app/lib/services/transactionLimits';
import { FraudDetectionService } from '@/app/lib/services/fraudDetection';
import { QuidaxService, QuidaxError } from '@/app/lib/services/quidax';
import { WebSocketService } from '@/app/lib/services/websocket';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import RateExpiryTimer from "@/app/components/trade/RateExpiryTimer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TradeService } from '@/app/lib/services/trade';
import { handleError } from '@/app/lib/utils/errorHandler';
import { PaymentMethodSelection } from "@/app/components/payment/PaymentMethodSelection";
import { useRateUpdates } from '@/app/hooks/useRateUpdates';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/app/lib/utils/currency";
import { MarketService } from '@/app/lib/services/market';
import { WalletService } from '@/app/lib/services/wallet';
import { MarketData, WalletBalance } from '@/app/types/market';

interface TradeRate {
  rate: number;
  fee: number;
  total: number;
  cryptoAmount: number;
}

const calculateTotal = (amount: number, rate: number, fee: number): number => {
  return amount * rate + fee;
};

const isValidRate = (rate: TradeRate | null): rate is TradeRate => {
  return rate !== null && 
    typeof rate.rate === 'number' && 
    typeof rate.fee === 'number' && 
    typeof rate.total === 'number' && 
    typeof rate.cryptoAmount === 'number';
};

const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'USDT', label: 'Tether' },
  { value: 'USDC', label: 'USD Coin' }
] as const;

export default function Trade() {
  const router = useRouter();
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("btc");
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [rate, setRate] = useState<TradeRate | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isKYCChecking, setIsKYCChecking] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('card');
  const [showPreview, setShowPreview] = useState(false);
  const [rateExpiry, setRateExpiry] = useState<Date | null>(null);
  const [isRateExpired, setIsRateExpired] = useState(false);
  const [fees, setFees] = useState({ network: 0, service: 0 });
  const {
    rate: rateUpdates,
    isLoading: isRateLoading,
    error: rateError,
    refreshRate,
    lastUpdateTime
  } = useRateUpdates({
    cryptoCurrency,
    onRateExpired: () => {
      toast({
        title: "Rate Expired",
        description: "The rate has been refreshed",
        variant: "destructive"
      });
    }
  });
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);

  // Fetch rate when amount or currency changes
  useEffect(() => {
    const fetchRate = async () => {
      if (!amount || isNaN(Number(amount))) return;

      try {
        const rateData = await CryptoTradeService.getRate({
          amount: Number(amount),
          cryptoCurrency,
          type: tradeType
        });
        setRate({
          ...rateData,
          cryptoAmount: Number(amount)
        });
        // Set rate expiry to 30 seconds from now
        setRateExpiry(new Date(Date.now() + 30000));
        setIsRateExpired(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Unable to fetch current rate",
          variant: "destructive"
        });
      }
    };

    const wsId = `rate_${cryptoCurrency}_${tradeType}`;
    WebSocketService.subscribe(wsId, (data) => {
      if (rate && data.pair === `${cryptoCurrency}_ngn`) {
        const currentAmount = Number(amount || 0);
        const currentFee = data.fee || 0;
        setRate(prev => ({
          ...prev!,
          rate: data.rate,
          total: calculateTotal(currentAmount, data.rate, currentFee)
        }));
      }
    });

    const debounce = setTimeout(fetchRate, 500);

    return () => {
      clearTimeout(debounce);
      WebSocketService.unsubscribe(wsId);
    };
  }, [amount, cryptoCurrency, tradeType, rate, toast]);

  // Check rate expiry
  useEffect(() => {
    if (!rateExpiry) return;

    const interval = setInterval(() => {
      if (new Date() > rateExpiry) {
        setIsRateExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rateExpiry]);

  useEffect(() => {
    if (amount && rate?.fee !== undefined) {
      const amountNum = Number(amount);
      const networkFee = amountNum * rate.fee;
      const serviceFee = amountNum * 0.02;
      setFees({ network: networkFee, service: serviceFee });
    }
  }, [amount, rate]);

  const checkKYCAndProceed = async () => {
    if (!user) return;
    
    setIsKYCChecking(true);
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
      toast({
        title: "Error",
        description: "Unable to verify KYC status",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsKYCChecking(false);
    }
  };

  const handleTrade = async () => {
    if (!user || !rate) return;
    
    try {
      setIsLoading(true);
      
      // Check KYC status
      // const isEligible = await checkKYCAndProceed();
      // if (!isEligible) return;

      // 1. Rate expiry check
      if (isRateExpired) {
        toast({
          title: "Rate Expired",
          description: "Please refresh the rate to continue",
          variant: "destructive"
        });
        return;
      }

      // 2. Transaction limit check
      const limitCheck = await TransactionLimitService.validateTransaction(user.id, Number(amount));
      if (!limitCheck.valid) {
        toast({
          title: "Limit Exceeded",
          description: limitCheck.reason,
          variant: "destructive"
        });
        return;
      }

      // 3. Fraud detection check
      const fraudCheck = await FraudDetectionService.analyzeTransaction({
        userId: user.id,
        amount: Number(amount),
        ipAddress: window.location.hostname,
        deviceId: navigator.userAgent
      });

      if (!fraudCheck.approved) {
        toast({
          title: "Security Check Failed",
          description: fraudCheck.reason,
          variant: "destructive"
        });
        return;
      }

      // 4. KYC check
      const isEligible = await checkKYCAndProceed();
      if (!isEligible) return;

      // 5. Wallet balance check for wallet payments
      if (selectedPaymentMethod === 'wallet') {
        const walletBalance = walletBalances.find(b => b.currency === 'NGN')?.available || 0;
        if (walletBalance < Number(amount)) {
          toast({
            title: "Insufficient Balance",
            description: "Please fund your wallet to continue",
            variant: "destructive"
          });
          return;
        }
      }

      // Proceed with trade
      const transaction = await QuidaxService.createTrade({
        amount: Number(amount),
        cryptoCurrency,
        type: tradeType,
        userId: user.id,
        paymentMethod: selectedPaymentMethod
      });

      // Handle payment method specific logic
      if (selectedPaymentMethod === 'wallet') {
        await handleWalletPayment(transaction);
      } else {
        if (transaction.payment_url) {
          window.location.href = transaction.payment_url;
        } else {
          router.push(`/transaction/${transaction.id}`);
        }
      }
    } catch (error) {
      handleError(error, 'Unable to create trade');
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  const handleWalletPayment = async (transaction: any) => {
    try {
      if (selectedPaymentMethod === 'wallet') {
        await WalletService.transferToExchange(user!.id, Number(amount));
      }
      await QuidaxService.processWalletPayment(transaction.id);
      router.push(`/transaction/${transaction.id}`);
    } catch (error) {
      handleError(error, 'Unable to process wallet payment');
    }
  };

  const handleTradeClick = () => {
    if (!isValidRate(rate) || !selectedPaymentMethod) {
      toast({
        title: "Invalid Trade",
        description: "Please ensure all trade details are valid",
        variant: "destructive"
      });
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmTrade = async () => {
    await handleTrade();
    setShowPreview(false);
  };

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    if (amount) {
      const amountNum = Number(amount);
      setSelectedPaymentMethod(method);
    }
  };

  // Add rate expiry warning
  const getRateStatus = () => {
    const timeSinceUpdate = Date.now() - lastUpdateTime;
    const minutes = Math.floor(timeSinceUpdate / 60000);
    
    if (minutes >= 4) {
      return (
        <div className="text-warning text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Rate expires in {5 - minutes} minute{5 - minutes > 1 ? 's' : ''}
        </div>
      );
    }
    return null;
  };

  // Add market data fetching
  useEffect(() => {
    if (!cryptoCurrency) return;

    const fetchMarketData = async () => {
      try {
        const data = await MarketService.getMarketData(
          `${cryptoCurrency.toLowerCase()}_ngn`
        );
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [cryptoCurrency]);

  // Add wallet balance fetching
  useEffect(() => {
    if (!user) return;

    const fetchWalletBalances = async () => {
      try {
        const balances = await WalletService.getWalletBalance(user.id);
        setWalletBalances(balances);
      } catch (error) {
        console.error('Error fetching wallet balances:', error);
      }
    };

    fetchWalletBalances();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Crypto</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue="buy"
          className="flex space-x-4 mb-4"
          onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="buy" id="buy" />
            <Label htmlFor="buy">Buy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sell" id="sell" />
            <Label htmlFor="sell">Sell</Label>
          </div>
        </RadioGroup>

        <div className="grid grid-cols-2 gap-4">
          <div>Amount:</div>
          <div>{amount} {cryptoCurrency.toUpperCase()}</div>
          
          <div>Rate:</div>
          <div>{rate?.rate?.toLocaleString() ?? '-'}</div>
          
          <div>Fee:</div>
          <div>{rate?.fee?.toLocaleString() ?? '-'}</div>
          
          <div className="font-bold">Total:</div>
          <div className="font-bold">₦{rate?.total.toLocaleString()}</div>
        </div>

        {rate && (
          <div className="flex justify-between items-center mt-2">
            <RateExpiryTimer 
              expiryDate={rateExpiry}
              onRefresh={() => {
                setAmount(amount); // This will trigger a rate refresh
              }}
              isLoading={isLoading}
            />
            <div className="text-sm">
              1 {cryptoCurrency.toUpperCase()} = ₦{rate.rate.toLocaleString()}
            </div>
          </div>
        )}

        {/* Add confirmation dialog */}
        {isConfirmOpen && (
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <TransactionPreview
                  type={tradeType}
                  amount={Number(amount)}
                  cryptoAmount={rate?.cryptoAmount ?? 0}
                  cryptoCurrency={cryptoCurrency.toUpperCase()}
                  rate={rate?.rate ?? 0}
                  paymentMethod={selectedPaymentMethod}
                />
                <PaymentMethodSelection
                  availableMethods={['card', 'bank', 'wallet'] as PaymentMethodType[]}
                  onSelect={handlePaymentMethodSelect}
                  selectedMethod={selectedPaymentMethod}
                  walletBalance={wallet?.balance}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTrade} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Transaction'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {rate && (
          <div className="mt-6 space-y-6">
            <TransactionPreview
              amount={Number(amount)}
              cryptoAmount={rate?.cryptoAmount ?? 0}
              cryptoCurrency={cryptoCurrency.toUpperCase()}
              rate={rate?.rate ?? 0}
              paymentMethod={selectedPaymentMethod}
              type={tradeType}
              onConfirm={() => {
                if (!rate) return;
                handleConfirmTrade();
              }}
              onCancel={() => setShowPreview(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        {showPreview && rate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <TransactionPreview
              amount={Number(amount)}
              cryptoAmount={rate.cryptoAmount}
              cryptoCurrency={cryptoCurrency.toUpperCase()}
              rate={rate.rate}
              paymentMethod={selectedPaymentMethod}
              type={tradeType}
              onConfirm={handleConfirmTrade}
              onCancel={() => setShowPreview(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        <PaymentMethodSelector
          onSelect={setSelectedPaymentMethod}
          selectedMethod={selectedPaymentMethod}
          amount={Number(amount)}
          walletBalance={wallet?.balance}
          disabled={isLoading}
        />

        <div className="space-y-4">
          {rateUpdates && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Current Rate: {formatCurrency(rateUpdates, 'NGN')}/{cryptoCurrency}
              </div>
              {getRateStatus()}
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshRate}
                disabled={isRateLoading}
              >
                <RefreshCw className={cn("h-4 w-4", {
                  "animate-spin": isRateLoading
                })} />
              </Button>
            </div>
          )}
          
          {rateError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{rateError}</AlertDescription>
            </Alert>
          )}
          
          {/* ... rest of the trade form ... */}
        </div>

        {marketData && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>24h High</span>
              <span>{formatCurrency(marketData.high_24h, 'NGN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>24h Low</span>
              <span>{formatCurrency(marketData.low_24h, 'NGN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>24h Volume</span>
              <span>{marketData.volume_24h.toFixed(8)} {cryptoCurrency}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}