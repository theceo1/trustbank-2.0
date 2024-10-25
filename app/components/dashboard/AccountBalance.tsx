"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';

interface BalanceData {
  total: number;
  available: number;
  pending: number;
  currency: string;
}

export default function AccountBalance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState<BalanceData>({
    total: 0,
    available: 0,
    pending: 0,
    currency: 'NGN'
  });
  const { user } = useAuth();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-green-600 text-white">
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">₦{balance.total.toFixed(2)}</span>
            <span className="ml-2 text-sm">NGN</span>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <p>Available: ₦{balance.available.toFixed(2)}</p>
            <p>Pending: ₦{balance.pending.toFixed(2)}</p>
          </div>
          <p className="text-sm mt-1">≈ {(balance.total / 30000).toFixed(8)} BTC</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4 w-full bg-black text-gray-100 hover:bg-gray-800">
            Deposit
          </Button>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Deposit Funds">
        <p className="text-green-600">Deposit feature COMING SOON.</p>
      </Modal>
    </motion.div>
  );
}
