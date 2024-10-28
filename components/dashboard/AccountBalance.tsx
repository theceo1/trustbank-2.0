"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from "framer-motion";

interface BalanceData {
  total: number;
  available: number;
  pending: number;
  currency: string;
}

export default function AccountBalance() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/balance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch balance');
        }

        setBalance(data);
      } catch (error) {
        console.error('Error fetching balance:', error);
        // Set default balance on error
        setBalance({
          total: 0,
          available: 0,
          pending: 0,
          currency: 'NGN'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {showBalance ? (
                    `${balance?.currency || 'NGN'} ${balance?.available.toFixed(2) || '0.00'}`
                  ) : (
                    '****'
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div>Pending: {balance?.currency} {balance?.pending.toFixed(2)}</div>
                <div>Total: {balance?.currency} {balance?.total.toFixed(2)}</div>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)} 
                className="mt-4 w-full bg-black text-gray-100 hover:bg-gray-800"
              >
                Deposit
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Deposit Funds">
        <p className="text-green-600">Deposit feature coming soon.</p>
      </Modal>
    </motion.div>
  );
}
