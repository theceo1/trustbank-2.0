"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';

const transactions = [
  { id: 1, type: "Buy", crypto: "BTC", amount: 0.5, value: 15000 },
  { id: 2, type: "Sell", crypto: "ETH", amount: 2, value: 4000 },
  { id: 3, type: "Buy", crypto: "ADA", amount: 100, value: 150 },
];

export default function RecentTransactions() {
  const [userTransactions, setUserTransactions] = useState(transactions);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch user's transactions from your API
      // This is a placeholder, replace with actual API call
      const fetchTransactions = async () => {
        const response = await fetch(`/api/transactions?userId=${user.id}`);
        const data = await response.json();
        setUserTransactions(data);
      };
      fetchTransactions();
    }
  }, [user]);

  if (!user) {
    return null; // Don't render anything if user is not signed in
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
                  {tx.value ? `$${tx.value.toLocaleString()}` : 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
