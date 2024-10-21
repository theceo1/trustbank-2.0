"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AccountBalance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 2, y: 0 }}
      transition={{ duration: 1.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">$15,000.00</p>
          <p className="text-sm text-gray-500 mt-2">+5.23% from last week</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
