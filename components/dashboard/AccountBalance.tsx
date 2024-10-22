"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';

export default function AccountBalance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch user's balance from your API
      // This is a placeholder, replace with actual API call
      const fetchBalance = async () => {
        const response = await fetch(`/api/balance?userId=${user.id}`);
        const data = await response.json();
        setBalance(data.balance);
      };
      fetchBalance();
    }
  }, [user]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-green-600 text-black">
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">₦{balance.toFixed(2)}</span>
            <span className="ml-2 text-sm">NGN</span>
          </div>
          <p className="text-sm mt-1">≈ {(balance / 30000).toFixed(8)} BTC</p>
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
