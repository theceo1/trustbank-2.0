"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Settings, CreditCard, LogOut, Shield, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  name?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user as UserProfile);
      } else {
        router.push('/auth/login');
      }
    }
    getUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900 p-4"
    >
      <Card className="w-full max-w-2xl overflow-hidden shadow-xl pt-20">
        <CardHeader className="bg-green-600 text-white p-2">
          <CardTitle className="text-lg font-bold">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-32 h-32 rounded-full overflow-hidden"
            >
              <Image
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name || user.email}`}
                alt="Profile"
                layout="fill"
                objectFit="cover"
              />
            </motion.div>
            <div className="flex-grow">
              <h2 className="text-lg font-semibold">{user.name || 'User'}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                  Verified
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4">
            <Link href="/profile/personal-info">
              <ProfileCard icon={<User className="w-6 h-6" />} title="Personal Info" description="Update your personal information" />
            </Link>
            <Link href="/profile/account-settings">
              <ProfileCard icon={<Settings className="w-6 h-6" />} title="Account Settings" description="Manage your account settings" />
            </Link>
            <Link href="/profile/billing">
              <ProfileCard icon={<CreditCard className="w-6 h-6" />} title="Billing" description="View and manage your billing information" />
            </Link>
            <Link href="/profile/verification">
              <ProfileCard icon={<Shield className="w-6 h-6" />} title="Verification Status" description="Check your account verification status" />
            </Link>
            <Link href="/profile/transaction-history">
              <ProfileCard icon={<History className="w-6 h-6" />} title="Transaction History" description="View your complete transaction history" />
            </Link>
          </div>
        </CardContent>
      </Card>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8"
      >
        <Button onClick={handleSignOut} variant="destructive" className="px-8 py-2">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </motion.div>
  );
}

function ProfileCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
    >
      <div className="flex items-center space-x-3">
        <div className="text-green-600 dark:text-green-400">{icon}</div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
