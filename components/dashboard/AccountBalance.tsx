"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react'; // Import the icons

interface BalanceData {
  total: number;
  available: number;
  pending: number;
  currency: string;
}

export default function AccountBalance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState<BalanceData>({
    total: 0,
    available: 0,
    pending: 0,
    currency: 'NGN'
  });
  const { user } = useAuth();
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        try {
          const response = await fetch(`/api/balance?userId=${user.id}`);
          const data = await response.json();
          if (data && typeof data.total === 'number') {
            setBalance(data);
          } else {
            console.error('Invalid balance data:', data);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };
      fetchBalance();
    }
  }, [user]);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const maskNumber = (num: number) => '****';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Account Balance</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBalanceVisibility}
            className="h-8 w-8 text-white hover:text-gray-200"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">
              ₦{showBalance ? balance.total.toFixed(2) : maskNumber(balance.total)}
            </span>
            <span className="ml-2 text-sm">NGN</span>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <p>Available: ₦{showBalance ? balance.available.toFixed(2) : maskNumber(balance.available)}</p>
            <p>Pending: ₦{showBalance ? balance.pending.toFixed(2) : maskNumber(balance.pending)}</p>
          </div>
          <p className="text-sm mt-1">≈ {showBalance ? (balance.total / 30000).toFixed(8) : '****'} BTC</p>
          <Button onClick={openModal} className="mt-4 w-full bg-black text-gray-100 hover:bg-gray-800">
            Deposit
          </Button>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Deposit Funds">
        <p className="text-green-600">Deposit feature COMING SOON.</p>
      </Modal>
    </motion.div>
  );
}
