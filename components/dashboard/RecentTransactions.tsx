"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const transactions = [
  { id: 1, type: "Buy", crypto: "BTC", amount: 0.5, value: 15000 },
  { id: 2, type: "Sell", crypto: "ETH", amount: 2, value: 4000 },
  { id: 3, type: "Buy", crypto: "ADA", amount: 100, value: 150 },
];

export default function RecentTransactions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 2, y: 0 }}
      transition={{ duration: 1.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {transactions.map((tx) => (
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