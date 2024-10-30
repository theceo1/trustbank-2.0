"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase/client";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import LoadingHistory from "@/app/components/history/LoadingHistory";
import TransactionList from "@/app/components/history/TransactionList";
import type { Transaction } from '@/app/types/transactions';

export default function HistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [user]);

  if (isLoading) return <LoadingHistory />;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TransactionList transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="deposits">
            <TransactionList 
              transactions={transactions.filter(t => t.type === 'deposit')} 
            />
          </TabsContent>

          <TabsContent value="withdrawals">
            <TransactionList 
              transactions={transactions.filter(t => t.type === 'withdrawal')} 
            />
          </TabsContent>

          <TabsContent value="trades">
            <TransactionList 
              transactions={transactions.filter(t => t.type === 'trade')} 
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}