"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  LogOut, 
  Shield, 
  History, 
  User as UserIcon, 
  Settings,
  Bell,
  Key,
  Wallet
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase/client";
import { User } from '@supabase/supabase-js';
import { Skeleton } from "@/components/ui/skeleton";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";
import { KYCTierInfo } from "../components/profile/KYCTierInfo";
import { KYCService } from "../lib/services/kyc";
import { useQuery } from "@tanstack/react-query";

export const dynamic = 'force-dynamic';

interface ExtendedUser extends Omit<User, 'created_at'> {
  user_metadata: {
    name?: string;
    is_verified?: boolean;
    email?: string;
  };
  email?: string;
  created_at?: string;
}

const menuItems = [
  {
    href: "/profile/personal-info",
    icon: <UserIcon className="w-6 h-6" />,
    title: "Personal Info",
    description: "Update your personal information",
    color: "text-blue-600"
  },
  {
    href: "/profile/security",
    icon: <Key className="w-6 h-6" />,
    title: "Security",
    description: "Manage your security settings",
    color: "text-red-600"
  },
  {
    href: "/profile/wallet",
    icon: <Wallet className="w-6 h-6" />,
    title: "Wallet",
    description: "Manage your wallet and transactions",
    color: "text-green-600"
  },
  {
    href: "/profile/notifications",
    icon: <Bell className="w-6 h-6" />,
    title: "Notifications",
    description: "Configure your notification preferences",
    color: "text-yellow-600"
  },
  {
    href: "/profile/verification",
    icon: <Shield className="w-6 h-6" />,
    title: "Verification",
    description: "Complete your KYC verification",
    color: "text-purple-600"
  },
  {
    href: "/profile/transaction-history",
    icon: <History className="w-6 h-6" />,
    title: "Transaction History",
    description: "View your complete transaction history",
    color: "text-indigo-600"
  }
];

// Update the KYCInfo interface to match the service return type
interface KYCInfo {
  status: string;
  currentTier: string;
  completedRequirements: string[];
  limits: {
    daily: number;
    monthly: number;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserData(user as ExtendedUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [toast]);

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

  const { data: kycInfo, isLoading: kycLoading } = useQuery<KYCInfo>({
    queryKey: ['kycInfo'],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not found');
      }
      const data = await KYCService.getUserKYCInfo(user.id);
      return data as KYCInfo;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <ProfileHeader />
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        >
          {menuItems.map((item, index) => (
            <Link href={item.href} key={item.href}>
              <ProfileCard
                icon={item.icon}
                title={item.title}
                description={item.description}
                color={item.color}
              />
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center mt-8"
      >
        <Button onClick={handleSignOut} variant="destructive" size="lg">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
      {kycInfo && !kycLoading && (
        <KYCTierInfo
          currentTier={kycInfo.currentTier}
          verificationStatus={kycInfo.status}
          completedRequirements={kycInfo.completedRequirements}
        />
      )}
    </div>
  );
}

function ProfileCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer ${color}`}
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
