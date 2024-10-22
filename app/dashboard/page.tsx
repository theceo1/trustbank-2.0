"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline';
import AccountBalance from '@/components/dashboard/AccountBalance';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import MarketOverview from '@/components/dashboard/MarketOverview';
import Trade from '@/components/dashboard/Trade';
import CryptoPriceTracker from '@/components/common/CryptoPriceTracker';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    setPortfolioValue(15000);
    const dummyData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: 10000 + Math.random() * 10000,
    }));
    setChartData(dummyData);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg text-green-600 font-bold mb-4 pt-12"
      >
        Dashboard
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 2 }}
        transition={{ delay: 0.2, duration: 1.5 }}
        className="text-lg text-gray-600 mb-4 mt-2"
      >
        Welcome, {user?.name || user?.email}.
      </motion.p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 1.5 }}
          className="lg:col-span-1"
        >
          <AccountBalance />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1.5 }}
            className="mt-8"
          >
            <CryptoPriceTracker />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1.5 }}
            className="mt-8"
          >
            <RecentTransactions />
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 1.5 }}
          className="lg:col-span-2"
        >
          <MarketOverview itemsPerPage={3} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.5 }}
            className="mt-8"
          >
            <Trade />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
