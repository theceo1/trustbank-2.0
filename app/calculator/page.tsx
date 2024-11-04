"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ParticleBackground from "@/app/components/calculator/ParticleBackground";
import CryptoCard from "@/app/components/calculator/CryptoCard";
import MarketInsights from "@/app/components/calculator/MarketInsights";
import { Modal } from "@/app/components/ui/modal";
import { Loader2 } from 'lucide-react';
import { useMediaQuery } from "@/app/hooks/use-media-query";
import ResponsiveContainer from "@/app/components/calculator/ResponsiveContainer";
import MobileBottomNav from "@/app/components/calculator/MobileBottomNav";
import PriceHistoryChart from '@/app/components/calculator/PriceHistoryChart';
import PriceStatistics from '@/app/components/calculator/PriceStatistics';
import { Check as CheckIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currencyIds } from '@/app/lib/constants/crypto';
import supabase from '@/lib/supabase/client';

const TAX_AMOUNT = 50; // NGN tax per transaction

type CurrencyType = "BTC" | "ETH" | "USDT" | "USDC";
type WalletActionType = "BUY" | "SELL";

export default function CalculatorPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("BTC");
  const [walletAction, setWalletAction] = useState<WalletActionType>("BUY");
  const [amount, setAmount] = useState("");
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showMarketInsights, setShowMarketInsights] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const calculateWithTax = (baseAmount: number) => {
    return baseAmount + TAX_AMOUNT;
  };

  const handleCalculate = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${currencyIds[selectedCurrency]}&vs_currencies=usd,ngn`
      );

      const data = response.data[currencyIds[selectedCurrency]];
      const usdAmount = parseFloat(amount);
      let nairaValue;

      if (walletAction === 'BUY') {
        nairaValue = (usdAmount * data.ngn) / data.usd;
      } else {
        nairaValue = (usdAmount * data.ngn) / data.usd;
      }

      // Add tax to the calculated amount
      const finalAmount = calculateWithTax(nairaValue);
      setCalculatedValue(finalAmount);
    } catch (error) {
      setError('Failed to fetch current rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setError(null);

    try {
      // First check if email exists
      const { data: existingUser } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        setShowSubscriptionModal(true);
        setEmail('');
        return;
      }

      // If email doesn't exist, insert new subscriber
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email,
          source: 'calculator_page',
          preferences: { interests: ['product_updates', 'calculator'] },
          metadata: { subscribed_from: 'calculator' }
        }]);

      if (error) throw error;

      setShowSubscriptionModal(true);
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      <ParticleBackground />
      
      <ResponsiveContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-center mt-14 mb-${isMobile ? '6' : '12'}`}
        >
          <h1 className={`${
            isMobile ? 'text-lg' : 'text-2xl'
          } font-bold text-green-600 mb-2`}>
            Crypto Calculator
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time cryptocurrency conversion rates
          </p>
        </motion.div>

        <div className={`grid grid-cols-1 ${
          isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-8'
        } max-w-7xl mx-auto`}>
          <CryptoCard
            selectedCurrency={selectedCurrency}
            walletAction={walletAction}
            amount={amount}
            loading={loading}
            calculatedValue={calculatedValue}
            error={error}
            onCurrencyChange={setSelectedCurrency}
            onActionChange={setWalletAction}
            onAmountChange={setAmount}
            onCalculate={handleCalculate}
          />
          
          {!isMobile && <MarketInsights />}
          
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Button
                onClick={() => setShowMarketInsights(!showMarketInsights)}
                className="w-full bg-green-600"
              >
                {showMarketInsights ? "Hide" : "Show"} Market Insights
              </Button>
              
              {showMarketInsights && <MarketInsights />}
            </motion.div>
          )}
        </div>

        <MobileBottomNav />
      </ResponsiveContainer>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold mb-4">
          Join Our Waitlist
        </h3>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className=""
          />
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black"
            disabled={isSubscribing}
          >
            {isSubscribing ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin" />
                <span>Subscribing...</span>
              </div>
            ) : (
              'Join Waitlist'
            )}
          </Button>
        </form>
      </motion.div>

      <AnimatePresence>
        {showSubscriptionModal && (
          <Modal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg text-green-600 font-bold mb-2">Welcome to TrustBank!</h2>
              <p className="text-muted-foreground mb-4">
                Thank you for joining our waitlist. We&apos;ll keep you updated on our latest developments.
              </p>
              <p className="mb-6 bg-gray-300 p-2 rounded-sm text-black"> 
                <span className="font-bold text-green-600">Signed:</span> Tony from trustBank
              </p>

              <Button
                onClick={() => setShowSubscriptionModal(false)}
                className="bg-green-600 hover:bg-green-300 text-white hover:text-black"
              >
                Close
              </Button>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
