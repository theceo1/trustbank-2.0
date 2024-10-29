"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';

export default function RecentTransactions() {
  const [userTransactions, setUserTransactions] = useState<Array<{
    id: number;
    type: string;
    crypto: string;
    amount: number;
    value: number;
  }>>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserTransactions([
        { id: 1, type: "Buy", crypto: "BTC", amount: 0.5, value: 15000 },
        { id: 2, type: "Sell", crypto: "ETH", amount: 2, value: 4000 },
        { id: 3, type: "Buy", crypto: "ADA", amount: 100, value: 150 },
      ]);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {userTransactions.map((tx) => (
              <li key={tx.id} className="flex justify-between items-center">
                <span>{tx.type} {tx.amount} {tx.crypto}</span>
                <span className={tx.type === "Buy" ? "text-green-500" : "text-red-500"}>
                  ${tx.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
