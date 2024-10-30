"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { Transaction } from "@/app/types/transactions";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {transaction.type === 'deposit' ? '+' : '-'}
                {transaction.currency} {transaction.amount.toFixed(2)}
              </p>
              <p className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}