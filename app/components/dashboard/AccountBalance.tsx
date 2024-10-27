"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

interface BalanceData {
  balance: number;
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
      try {
        const response = await fetch('/api/balance');
        const data = await response.json();
        
        if (response.ok) {
          setBalance(data);
        } else {
          console.error('Invalid balance data:', data);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBalance();
    }
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
            <div>Loading...</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {showBalance ? (
                    `${balance?.currency || 'NGN'} ${balance?.balance?.toFixed(2) || '0.00'}`
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
