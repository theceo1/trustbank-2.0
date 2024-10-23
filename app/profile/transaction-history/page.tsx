"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

interface Transaction {
  id: number;
  type: string;
  crypto: string;
  amount: number;
  value: number;
  date: string;
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      router.push('/auth/login');
    }
  }, [user, router]);

  const fetchTransactions = async () => {
    // Replace this with actual API call to fetch transactions
    const mockTransactions: Transaction[] = [
      { id: 1, type: "Buy", crypto: "BTC", amount: 0.5, value: 15000, date: "2023-06-01" },
      { id: 2, type: "Sell", crypto: "ETH", amount: 2, value: 4000, date: "2023-06-02" },
      { id: 3, type: "Buy", crypto: "ADA", amount: 100, value: 150, date: "2023-06-03" },
    ];
    setTransactions(mockTransactions);
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Type,Crypto,Amount,Value,Date\n"
      + transactions.map(t => `${t.id},${t.type},${t.crypto},${t.amount},${t.value},${t.date}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Downloaded",
      description: "Your transaction history has been downloaded as a CSV file.",
    });
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pt-28"
    >
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button onClick={exportToCSV} className="flex items-center text-sm h-8 w-32 rounded-sm hover:bg-green-600">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-green-600 text-white">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Crypto</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="bg-gray-200 border-b text-black">
                    <td className="px-6 py-4">{tx.date}</td>
                    <td className="px-6 py-4">{tx.type}</td>
                    <td className="px-6 py-4">{tx.crypto}</td>
                    <td className="px-6 py-4">{tx.amount}</td>
                    <td className="px-6 py-4">${tx.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}