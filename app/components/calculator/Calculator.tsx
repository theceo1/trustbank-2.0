"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, AlertCircle } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [calculatedValue, setCalculatedValue] = useState<CalculatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const cryptoAmount = usdAmount / data.usdPrice;
      const ngnAmount = usdAmount * data.rate;

      setCalculatedValue({
        ngnAmount,
        cryptoAmount,
        rate: data.rate,
        usdAmount
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate rate');
      setCalculatedValue(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CRYPTO_OPTIONS.map((crypto) => (
          <Button
            key={crypto.value}
            variant={selectedCurrency === crypto.value ? "default" : "outline"}
            className={selectedCurrency === crypto.value ? "bg-green-600" : ""}
            onClick={() => setSelectedCurrency(crypto.value)}
          >
            <span className="text-lg mr-2">{crypto.icon}</span>
            <span>{crypto.value}</span>
          </Button>
        ))}
      </div>

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

      <Button 
        className="w-full bg-green-600 hover:bg-green-700" 
        onClick={handleCalculate}
        disabled={loading || !amount}
      >
        {loading ? "Calculating..." : "Calculate Rate"}
      </Button>

      <AnimatePresence mode="wait">
        {calculatedValue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            <div className="p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                ₦{calculatedValue.ngnAmount.toLocaleString('en-NG', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </h3>
              <p className="text-sm text-muted-foreground">
                Estimated amount to pay for {calculatedValue.cryptoAmount.toFixed(8)} {selectedCurrency}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Rate:</span> ₦{calculatedValue.rate.toLocaleString()} / USD
              </div>
            </div>
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