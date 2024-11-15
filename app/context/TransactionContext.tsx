"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import { Transaction, TransactionType } from '@/app/types/transactions';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase/client';

interface TransactionContextType {
  addTransaction: (transaction: Partial<Transaction>) => Promise<void>;
  updateTransactionStatus: (id: string, status: string) => Promise<void>;
  getTransactionById: (id: string) => Promise<Transaction | null>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const addTransaction = useCallback(async (transaction: Partial<Transaction>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...transaction
        }])
        .select()
        .single();

      if (error) throw error;

      const amount = transaction.amount || 0;
      const type = transaction.type as TransactionType;
      
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Initiated`,
        description: `${type === 'buy' || type === 'sell' ? 'Trade' : type} of ${transaction.currency} ${amount.toFixed(2)} has been initiated.`,
      });

      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }, [user, toast]);

  const updateTransactionStatus = useCallback(async (id: string, status: string) => {
    if (!id) throw new Error('Transaction ID is required');
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }, []);

  const getTransactionById = useCallback(async (id: string): Promise<Transaction | null> => {
    if (!id) return null;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }, []);

  return (
    <TransactionContext.Provider value={{
      addTransaction,
      updateTransactionStatus,
      getTransactionById
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}