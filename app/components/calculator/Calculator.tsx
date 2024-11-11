"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CRYPTO_OPTIONS = [
  { value: "BTC", label: "Bitcoin", icon: "₿" },
  { value: "ETH", label: "Ethereum", icon: "Ξ" },
  { value: "USDT", label: "Tether", icon: "₮" },
  { value: "USDC", label: "USD Coin", icon: "₵" }
] as const;

interface CalculatedResult {
  ngnAmount: number;
  cryptoAmount: number;
  rate: number;
  usdAmount: number;
}

export default function Calculator() {
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<"BTC" | "ETH" | "USDT" | "USDC">("BTC");
  const [walletAction, setWalletAction] = useState<"BUY" | "SELL">("BUY");
  const [loading, setLoading] = useState(false);
  const [calculatedValue, setCalculatedValue] = useState<CalculatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleCalculate = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/crypto/rate/${selectedCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch rate');
      const data = await response.json();
      
      const usdAmount = parseFloat(amount);
      const cryptoAmount = selectedCurrency === 'BTC' ? usdAmount / data.usdPrice : usdAmount;
      const ngnAmount = usdAmount * data.rate;

      setCalculatedValue({
        ngnAmount,
        cryptoAmount,
        rate: data.rate,
        usdAmount
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate rate');
      setCalculatedValue(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Currency Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CRYPTO_OPTIONS.map((crypto) => (
          <Button
            key={crypto.value}
            variant={selectedCurrency === crypto.value ? "default" : "outline"}
            className={`${
              selectedCurrency === crypto.value ? "bg-green-600" : ""
            } flex items-center justify-center space-x-2`}
            onClick={() => setSelectedCurrency(crypto.value)}
          >
            <span className="text-lg">{crypto.icon}</span>
            <span>{crypto.value}</span>
          </Button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="relative">
        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          type="number"
          placeholder="Enter amount in USD"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Transaction Type */}
      <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
        <span className="text-sm text-muted-foreground">Transaction Type</span>
        <div className="flex space-x-2">
          <Button
            variant={walletAction === "BUY" ? "default" : "outline"}
            size="sm"
            onClick={() => setWalletAction("BUY")}
            className={walletAction === "BUY" ? "bg-green-600" : ""}
          >
            Buy
          </Button>
          <Button
            variant={walletAction === "SELL" ? "default" : "outline"}
            size="sm"
            onClick={() => setWalletAction("SELL")}
            className={walletAction === "SELL" ? "bg-green-600" : ""}
          >
            Sell
          </Button>
        </div>
      </div>

      {/* Calculate Button */}
      <Button 
        className="w-full bg-green-600 hover:bg-green-700" 
        onClick={handleCalculate}
        disabled={loading || !amount}
      >
        {loading ? "Calculating..." : "Calculate Rate"}
      </Button>

      {/* Results Display */}
      <AnimatePresence mode="wait">
        {calculatedValue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            <div className="p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₦{calculatedValue.ngnAmount.toLocaleString('en-NG', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </h3>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span suppressHydrationWarning>
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {walletAction === 'BUY' 
                  ? `Estimated amount to pay for $${calculatedValue.usdAmount} worth of ${selectedCurrency} (${calculatedValue.cryptoAmount.toFixed(8)} ${selectedCurrency})`
                  : `Estimated amount to receive for $${calculatedValue.usdAmount} worth of ${selectedCurrency} (${calculatedValue.cryptoAmount.toFixed(8)} ${selectedCurrency})`
                }
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Rate:</span> ₦{calculatedValue.rate.toLocaleString()} / USD
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-muted-foreground">
                This is an estimated value. Actual rates may vary during live trading due to market volatility and liquidity conditions.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}