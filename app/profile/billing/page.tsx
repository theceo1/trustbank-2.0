"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/auth/login');
      }
    }
    getUser();
  }, [supabase, router]);

  const handleUpgrade = () => {
    // Implement upgrade logic here
    toast({
      title: "Upgrade initiated",
      description: "You will be redirected to the payment page.",
    });
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Current Plan: Free</p>
          <Button onClick={handleUpgrade} className="w-full">Upgrade to Premium</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}