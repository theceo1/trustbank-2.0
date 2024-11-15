"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/modal";
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, TrendingUp, TrendingDown, Shield, Users } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import supabase from '@/lib/supabase/client';
import { usePlausible } from 'next-plausible'
import { SUPPORTED_CRYPTOCURRENCIES } from "../lib/constants/crypto";
import { TradeService } from '@/app/services/TradeService';

type TradeAction = 'buy' | 'sell';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
}

const MarketStats = ({ cryptoPrices }: { cryptoPrices: CryptoPrice[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
  >
    {cryptoPrices.map((crypto) => (
      <Card key={crypto.symbol} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{crypto.symbol}</span>
              <span className="text-sm text-muted-foreground">${crypto.price.toFixed(2)}</span>
            </div>
            <span className={`flex items-center ${crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {crypto.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(crypto.change24h).toFixed(2)}%
            </span>
          </div>
        </CardContent>
      </Card>
    ))}
  </motion.div>
);

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function TradePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [action, setAction] = useState<TradeAction>('buy');
  const [currency, setCurrency] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const { toast } = useToast();
  const plausible = usePlausible()
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/trade');
      return;
    }

    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/crypto/prices');
        if (!response.ok) throw new Error('Failed to fetch prices');
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid price data format');
        }

        const formattedPrices = SUPPORTED_CRYPTOCURRENCIES.map(symbol => ({
          symbol,
          price: data[symbol]?.price || 0,
          change24h: data[symbol]?.change24h || 0
        }));

        setCryptoPrices(formattedPrices);
      } catch (error) {
        console.error('Failed to fetch crypto prices:', error);
        // Set default empty prices to prevent UI errors
        setCryptoPrices(SUPPORTED_CRYPTOCURRENCIES.map(symbol => ({
          symbol,
          price: 0,
          change24h: 0
        })));
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [user, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetAmount = params.get('amount');
    const presetCurrency = params.get('currency');
    const presetType = params.get('type') as TradeAction;

    if (presetAmount) setAmount(presetAmount);
    if (presetCurrency) setCurrency(presetCurrency);
    if (presetType) setAction(presetType);
  }, []);

  const handleTrade = async () => {
    if (!user || !amount || !selectedCryptoPrice) {
      toast({
        title: "Invalid Trade",
        description: "Please ensure all trade details are valid",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await TradeService.executeTrade({
        userId: user.id,
        type: action,
        currency,
        amount: parseFloat(amount),
        rate: selectedCryptoPrice.price
      });

      // Track the trade event
      plausible('Trade', {
        props: {
          type: action,
          currency,
          amount: parseFloat(amount)
        }
      });

      toast({
        title: "Trade Successful",
        description: `Your ${action} order for ${amount} USD of ${currency} has been initiated.`,
        duration: 5000,
      });

      // Reset form
      setAmount('');
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Unable to process your trade",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCryptoPrice = Array.isArray(cryptoPrices) 
    ? cryptoPrices.find(c => c.symbol === currency)
    : null;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <MarketStats cryptoPrices={cryptoPrices} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-xl h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-lg font-semibold gap-2">
                  <span>MarketPrice:</span>
                   {selectedCryptoPrice && (
                    <div className="flex items-center gap-2 text-base sm:text-lg">
                      <span> ${Number(selectedCryptoPrice.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</span>
                      <span className={`flex items-center ${selectedCryptoPrice.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedCryptoPrice.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(selectedCryptoPrice.change24h).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-2 ${action === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-l transition-colors duration-300`}
                    onClick={() => setAction('buy')}
                  >
                    Buy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-2 ${action === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-r transition-colors duration-300`}
                    onClick={() => setAction('sell')}
                  >
                    Sell
                  </motion.button>
                </div>
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  handleOpenModal(); 
                }} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="currency">
                      Currency
                    </label>
                    <Select onValueChange={setCurrency} value={currency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="amount in USD">
                      Amount in USD
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button type="submit" className={`w-full py-2 px-4 rounded-md ${
                      action === 'buy' ? 'bg-green-500 hover:bg-green-600 hover:text-black' : 'bg-red-500 hover:bg-red-600 hover:text-black'
                    } text-white font-bold transition-colors duration-300`}>
                      {action === 'buy' ? 'Buy' : 'Sell'} {currency}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-xl h-full">
              <CardHeader>
                <CardTitle>Order Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                    <span className={action === 'buy' ? 'text-green-500' : 'text-red-500'}>
                      {action.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount (USD)</span>
                    <span>${amount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estimated {currency}</span>
                    <span>
                      {selectedCryptoPrice && amount 
                        ? (parseFloat(amount) / selectedCryptoPrice.price).toFixed(8)
                        : '0.00000000'
                      }
                    </span>
                  </div>
                  <Button
                    onClick={handleOpenModal}
                    disabled={!amount || isLoading}
                    className="w-full"
                    variant={action === 'buy' ? 'default' : 'destructive'}
                  >
                    {isLoading ? 'Processing...' : `${action.toUpperCase()} ${currency}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>P2P Trading with Escrow</span>
              </CardTitle>
              <CardDescription>
                Secure peer-to-peer trading with our escrow service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Coming Soon!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Trade directly with other users using our secure escrow service. 
                      Stay tuned for this exciting feature!
                    </p>
                  </div>
                </div>
                <Button disabled className="w-full">
                  Feature Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Modal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            title={`Confirm ${action}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 2, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <p className="text-gray-700 dark:text-gray-300">
                You are about to {action} ${amount} worth of {currency}. Do you want to proceed?
              </p>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTrade}
                  variant={action === 'buy' ? 'default' : 'destructive'}
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
      <p className="text-sm text-muted-foreground">
        Last updated: {currentTime}
      </p>
    </div>
  );
}
