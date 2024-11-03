// app/components/calculator/CryptoCard.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpDown, 
  DollarSign, 
  RefreshCcw, 
  Info,
  Wallet,
  TrendingUp,
  History
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Icons } from "@/app/components/ui/icons";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import React from "react";
interface CryptoCardProps {
  selectedCurrency: "BTC" | "ETH" | "USDT" | "USDC";
  walletAction: "BUY" | "SELL";
  amount: string;
  loading: boolean;
  calculatedValue: number | null;
  error: string | null;
  onCurrencyChange: (currency: "BTC" | "ETH" | "USDT" | "USDC") => void;
  onActionChange: (action: "BUY" | "SELL") => void;
  onAmountChange: (amount: string) => void;
  onCalculate: () => void;
}

type CryptoIconType = "BTC" | "ETH" | "USDT" | "USDC";

// Define the icon dimensions as constants
const ICON_WIDTH = 24;
const ICON_HEIGHT = 24;

// Create a mapping for crypto icons using SVG components
const CryptoIcons = {
  BTC: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-orange-500"
    >
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.974.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.18-.24.45-.614.35.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.236-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z" />
    </svg>
  ),
  ETH: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-blue-500"
    >
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
    </svg>
  ),
  USDT: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-green-500"
    >
      <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm.125 18.75h-1.5v1.5h1.5v-1.5zm0-12h-1.5v1.5h1.5v-1.5z" />
    </svg>
  ),
  USDC: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-blue-400"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5v15c-4.078 0-7.5-3.422-7.5-7.5 0-4.078 3.422-7.5 7.5-7.5z" />
    </svg>
  ),
};

export default function CryptoCard({
  selectedCurrency,
  walletAction,
  amount,
  loading,
  calculatedValue,
  error,
  onCurrencyChange,
  onActionChange,
  onAmountChange,
  onCalculate
}: CryptoCardProps) {
  const [activeTab, setActiveTab] = useState("calculator");
  const [quickAmount, setQuickAmount] = useState(100);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Card className={`backdrop-blur-sm border-2 ${
      isMobile ? 'rounded-none border-x-0' : 'rounded-lg'
    }`}>
      <CardHeader className={isMobile ? 'px-4 py-3' : 'p-6'}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            <span className="text-green-600">trust</span>Rate™
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            Beta
          </Badge>
        </div>
        <CardDescription>Market rate you can trust</CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? 'px-4 pb-4' : 'p-6'}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calculator">
              <DollarSign className="w-4 h-4 mr-2" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="quick">
              <Wallet className="w-4 h-4 mr-2" />
              Quick Trade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Select Currency
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {(Object.keys(CryptoIcons) as CryptoIconType[]).map((currency) => (
                    <Button
                      key={currency}
                      variant={selectedCurrency === currency ? "default" : "outline"}
                      className={`w-full ${
                        selectedCurrency === currency ? "bg-green-600 hover:bg-green-700" : ""
                      }`}
                      onClick={() => onCurrencyChange(currency)}
                    >
                      <div className="flex items-center gap-2">
                        {React.createElement(CryptoIcons[currency])}
                        <span>{currency}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <motion.div
                initial={false}
                animate={{ height: "auto" }}
                className="space-y-4"
              >
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Enter amount in USD"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex justify-between items-center p-2 rounded-lg">
                  <span className="text-sm text-muted-foreground">Transaction Type</span>
                  <div className="flex space-x-2">
                    <Button
                      variant={walletAction === "BUY" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onActionChange("BUY")}
                      className={walletAction === "BUY" ? "bg-green-600" : ""}
                    >
                      Buy
                    </Button>
                    <Button
                      variant={walletAction === "SELL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onActionChange("SELL")}
                      className={walletAction === "SELL" ? "bg-green-600" : ""}
                    >
                      Sell
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={onCalculate}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={false}
                    animate={{
                      x: loading ? ["0%", "100%"] : "0%",
                      opacity: loading ? [0, 0.1, 0] : 0
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1
                    }}
                  />
                  <span className="relative z-10">
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      "Calculate Rate"
                    )}
                  </span>
                </Button>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4">
            <div className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground">
                  Quick Amount (USD)
                </label>
                <Slider
                  value={[quickAmount]}
                  onValueChange={(value) => setQuickAmount(value[0])}
                  max={5000}
                  step={100}
                  className="mt-2"
                />
                <div className="flex justify-between mt-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickAmount(amount)}
                      className={quickAmount === amount ? "border-green-600" : ""}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onAmountChange(quickAmount.toString());
                    onActionChange("BUY");
                    setActiveTab("calculator");
                    onCalculate();
                  }}
                >
                  Quick Buy
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    onAmountChange(quickAmount.toString());
                    onActionChange("SELL");
                    setActiveTab("calculator");
                    onCalculate();
                  }}
                >
                  Quick Sell
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          {calculatedValue !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <h3 className="text-2xl font-bold text-green-600">
                ₦{calculatedValue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {walletAction === 'BUY' 
                  ? `Amount to pay in NGN for ${amount} USD of ${selectedCurrency}`
                  : `Amount to receive in NGN for ${amount} USD of ${selectedCurrency}`}
              </p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <History className="w-3 h-3 mr-1" />
                <span>Rate last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}