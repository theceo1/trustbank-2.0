"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import axios from 'axios';
import Image from 'next/image';
import { Modal } from "@/app/components/ui/modal";

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    ngn: number;
  };
}

const currencyIds = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin'
};

export default function CalculatorPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ETH' | 'USDT' | 'USDC'>('BTC');
  const [walletAction, setWalletAction] = useState('BUY');
  const [amount, setAmount] = useState("");
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMarketValue = async () => {
    setLoading(true);
    setError(null);
    setCalculatedValue(null);

    try {
      const currencyId = currencyIds[selectedCurrency];
      const response = await axios.get<CoinGeckoResponse>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${currencyId}&vs_currencies=usd,ngn`
      );

      const currencyData = response.data[currencyId];

      if (!currencyData) {
        throw new Error(`No data found for ${selectedCurrency}`);
      }

      const usdRate = currencyData.usd;
      const ngnRate = currencyData.ngn;
      const usdAmount = parseFloat(amount);
      
      let value: number;
      if (walletAction === 'BUY') {
        value = (usdAmount / usdRate) * ngnRate;
      } else {
        value = (usdAmount * ngnRate) / usdRate;
      }

      setCalculatedValue(value);
    } catch (err: any) {
      console.error("Error fetching market value:", err);
      setError('Failed to fetch market value. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleCalculate = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount.');
      return;
    }
    fetchMarketValue();
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionError(null);

    // Simulating subscription process
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(true);
      setEmail('');
    }, 1500);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Rate Calculator
      </motion.h1>
      <h2 className="text-2lg font-semibold mb-8 text-gray-700">Market rates you can trust</h2>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-4">CRYPTO | <span className="text-green-600">TRUST</span></CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="space-y-2">
              <div className="flex space-x-6 p-2 rounded-lg">
                {Object.keys(currencyIds).map((currency) => (
                  <Button
                    key={currency}
                    variant={selectedCurrency === currency ? (walletAction === 'SELL' ? 'destructive' : 'default') : 'outline'}
                    onClick={() => setSelectedCurrency(currency as 'BTC' | 'ETH' | 'USDT' | 'USDC')}
                  >
                    {currency}
                  </Button>
                ))}
              </div>
              <Select onValueChange={(value) => setWalletAction(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wallet Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount in USD"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button type="submit" className="w-full bg-green-600" disabled={loading}>
                {loading ? "Calculating..." : "Calculate"}
              </Button>
            </form>
            {error && <p className="mt-4 text-red-500">{error}</p>}
            {calculatedValue !== null && (
              <div className="mt-4">
                <p className="text-2xl font-bold">{formatNaira(calculatedValue)}</p>
                <p className="text-sm text-muted-foreground text-green-600">
                  {walletAction === 'BUY' 
                    ? <> <span className="text-green-600 font-bold">You need to pay {formatNaira(calculatedValue)} NGN to buy ${amount} USD worth of {selectedCurrency}</span></>
                    : <> <span className="text-green-600 font-bold">You&apos;ll get {formatNaira(calculatedValue)} NGN for selling ${amount} USD worth of {selectedCurrency}</span></>}
                </p>
                <p className="text-xs text-muted-foreground mt-2 text-green-600">NOTE: This is an estimated rate. Actual rate may differ</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex items-center justify-center mb-8">
        <Image
          src="/images/calculator-illustration.png"
          alt="Calculator Illustration"
          width={400}
          height={400}
          unoptimized
        />
      </div>

      <div className="mt-8 text-center max-w-md mx-auto">
        <p className="text-sm text-gray-600 mb-2">JOIN THE <span className='text-green-600'>TRUSTED</span> COMMUNITY TODAY</p>
        <form onSubmit={handleSubscribe} className="mt-2 flex flex-col items-center">
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe to the Waitlist'}
          </Button>
          {subscriptionError && <p className="text-red-500 mt-2">{subscriptionError}</p>}
        </form>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4 text-black">Subscribed</h2>
        <p className="text-green-600">Welcome to the <span className="font-bold text-green-600">TRUSTED</span> community.🤝</p>
        <p className="text-green-600">We will reach out to you soon.</p>
        <p className="mt-6 bg-gray-300 p-2 rounded-lg text-black"> <span className="font-bold text-green-600">Signed:</span> Tony from trustBank</p>
        <Button onClick={closeModal} className="mt-4 bg-red-600 hover:bg-red-700 text-white w-50% mx-auto">Close</Button>
      </Modal>
    </div>
  );
}
