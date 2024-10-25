"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        if (data) setBalance(data.balance);
      };
      fetchBalance();
    }
  }, [user, supabase]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your current balance is: ₦{balance.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}