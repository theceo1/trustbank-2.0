"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AccountBalance from '@/components/dashboard/AccountBalance';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import MarketOverview from '@/components/dashboard/MarketOverview';
import Trade from '@/components/dashboard/Trade';
import CryptoPriceTracker from '@/components/common/CryptoPriceTracker';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Announcements from '@/app/components/dashboard/Announcements';
import supabaseClient from '@/lib/supabase/client';
import supabase from "@/lib/supabase/client";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user?.user_metadata?.is_verified) {
        setIsVerified(true);
      }
    };
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        if (profile?.full_name) {
          setDisplayName(profile.full_name);
        } else if (user.user_metadata?.name) {
          setDisplayName(user.user_metadata.name);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'User');
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-8 text-green-600">
          Welcome back, {displayName}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 fa-solid fa-chart-line text-sm">
          <i>Here&apos;s an overview of your financial activities.</i> 
        </p>
      </motion.div>
      
      <Announcements isVerified={isVerified} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-1 space-y-8"
        >
          <AccountBalance />
          <CryptoPriceTracker />
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/trade" className="block">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-400 transition-colors hover:text-black">
                  Trade Now
                </button>
              </Link>
              <Link href="/profile" className="block">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-400 transition-colors hover:text-black">
                  View Profile
                </button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-2 space-y-8"
        >
          <MarketOverview itemsPerPage={5} />
          <Trade />
          <RecentTransactions />
        </motion.div>
      </div>
    </div>
  );
}
