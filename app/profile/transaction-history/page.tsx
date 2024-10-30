// app/profile/transaction-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import BackButton from '@/components/ui/back-button';
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'swap';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackButton />
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div variants={itemVariants} className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="swap">Swaps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {transaction.type === 'deposit' ? (
                        <ArrowDownLeft className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold capitalize">{transaction.type}</p>
                        <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {transaction.type === 'deposit' ? '+' : '-'}₦{transaction.amount.toFixed(2)}
                      </p>
                      <p className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-8 text-gray-500"
              >
                No transactions found
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
