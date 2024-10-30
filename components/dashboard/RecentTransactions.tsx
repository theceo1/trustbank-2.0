"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import supabase from "@/lib/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TransactionsSkeleton } from "@/app/components/skeletons";

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  amount: number;
  fiat_amount: number;
  fiat_currency: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

interface TransactionPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: {
    id: string;
    amount: number;
    type: string;
    status: string;
    created_at: string;
  };
  old: any;
}

export default function RecentTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('transactions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload: TransactionPayload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [
              {
                ...payload.new,
                fiat_amount: payload.new.amount,
                fiat_currency: '₦'
              } as Transaction,
              ...prev.slice(0, 4)
            ]);
          } else {
            fetchTransactions();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (!user) return null;

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
          {isLoading ? (
            <TransactionsSkeleton />
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No transactions yet
            </p>
          ) : (
            <ul className="space-y-4">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {tx.type === 'buy' ? 'Bought' : 
                       tx.type === 'sell' ? 'Sold' : 
                       tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      {tx.crypto_amount && ` ${tx.crypto_amount} ${tx.crypto_currency}`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={tx.type === 'buy' || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}>
                      {tx.type === 'buy' || tx.type === 'withdrawal' ? '-' : '+'}
                      {tx.fiat_currency} {tx.fiat_amount.toLocaleString()}
                    </span>
                    <Badge variant={
                      tx.status === 'completed' ? 'default' :
                      tx.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {tx.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
