"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { KYCService } from "@/app/lib/services/kyc";
import { WalletService } from '@/app/lib/services/wallet';
import { QuidaxService } from '@/app/lib/services/quidax';
import { TransactionLimitService } from '@/app/lib/services/transactionLimits';
import { FraudDetectionService } from '@/app/lib/services/fraudDetection';
import { PaymentMethodType } from '@/app/types/payment';
import { WalletBalance } from '@/app/types/market';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

// Define the TradeRate type
interface TradeRate {
  rate: number;
  fee: number;
  total: number;
  cryptoAmount: number;
}

export default function Trade() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("btc");
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [rate, setRate] = useState<TradeRate | null>(null); // Initialize rate state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isKYCChecking, setIsKYCChecking] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('card');
  const [showPreview, setShowPreview] = useState(false);
  const [rateExpiry, setRateExpiry] = useState<Date | null>(null);
  const [isRateExpired, setIsRateExpired] = useState(false);
  const [fees, setFees] = useState({ network: 0, service: 0 });
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);

  const handleTrade = async () => {
    if (!user || !rate) return; // Ensure rate is defined

    try {
      setIsLoading(true);

      // Check KYC status
      const isEligible = await checkKYCAndProceed();
      if (!isEligible) return;

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

      // 4. Wallet balance check for wallet payments
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

  const checkKYCAndProceed = async (): Promise<boolean> => {
    if (!user) return false;
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
      console.error('KYC check error:', error);
      return false;
    } finally {
      setIsKYCChecking(false);
    }
  };

  const handleWalletPayment = async (transaction: { id: string }) => {
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

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}>
              <SelectTrigger>
                <SelectValue placeholder="Select trade type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setCryptoCurrency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin</SelectItem>
                <SelectItem value="ETH">Ethereum</SelectItem>
                <SelectItem value="USDT">Tether</SelectItem>
                <SelectItem value="USDC">USD Coin</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={handleTrade} className="w-full">
              {tradeType === "buy" ? "Buy" : "Sell"} {cryptoCurrency}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
