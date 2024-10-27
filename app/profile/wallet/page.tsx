"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Eye, EyeOff, Repeat } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [fromCrypto, setFromCrypto] = useState("");
  const [toCrypto, setToCrypto] = useState("");
  const [swapAmount, setSwapAmount] = useState("");
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        if (data) setBalance(data.balance);
      };
      fetchBalance();
    }
  }, [user, supabase]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const maskNumber = (num: number) => '****';

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-green-600 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
            className="h-4 w-4 text-green-600 hover:text-green-700"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-bold">
                ₦ {showBalance ? balance.toFixed(2) : maskNumber(balance)}
              </h2>
              <p className="text-sm opacity-80 mt-2">
                ≈ {showBalance ? (balance / 30000).toFixed(8) : '****'} BTC
              </p>
              <Button 
                onClick={() => setIsDepositModalOpen(true)} 
                className="mt-4 w-full bg-black text-gray-100 hover:bg-gray-800"
              >
                Deposit
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Swap Crypto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select onValueChange={setFromCrypto}>
                  <SelectTrigger>
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setToCrypto}>
                  <SelectTrigger>
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Amount"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                />

                <Button className="w-full bg-green-600 hover:bg-green-300 hover:text-black">
                  Swap
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/profile/withdrawal">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600"><i>Initiate a withdrawal to your bank account</i></p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/profile/transaction-history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600"><i>View your transaction history</i></p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mt-8">
        <Button asChild className="w-full md:w-auto bg-green-600 hover:bg-green-300 hover:text-black">
          <Link href="/trade">Start Trading</Link>
        </Button>
      </motion.div>

      <Modal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)}
        title="Deposit Funds"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <i>Make a deposit to your wallet using your preferred payment method.</i>
          </p>
          <Input
            type="number"
            placeholder="Enter amount in NGN"
            className="mb-4"
          />
          <Button className="w-full bg-green-600 hover:bg-green-300 hover:text-black">
            Proceed to Payment
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
