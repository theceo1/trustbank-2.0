"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import VerificationBadge from './VerificationBadge';
import supabase from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  user_id: string;
  full_name: string;
  is_verified: boolean;
  created_at: string;
  referral_code: string;
}

export default function ProfileHeader() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setDisplayName(data.full_name);
          setReferralCode(data.referral_code);
        } else if (user.user_metadata?.name) {
          setDisplayName(user.user_metadata.name);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'User');
        }

        setIsVerified(!!user.user_metadata?.is_verified);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareReferralCode = async () => {
    try {
      await navigator.share({
        title: 'Join trustBank',
        text: `Join trustBank using my referral code: ${referralCode}`,
        url: `${window.location.origin}/auth/signup?ref=${referralCode}`,
      });
    } catch (err) {
      toast({
        title: "Sharing failed",
        description: "Your browser might not support sharing",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-green-600">
            {displayName}&apos;s profile
          </h1>
          <VerificationBadge isVerified={isVerified} />
        </div>
        
        {referralCode && (
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between gap-2">
              <span className="text-sm font-mono">{referralCode}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyReferralCode}
                  className="hover:text-green-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareReferralCode}
                  className="hover:text-green-600"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Share your referral code to earn rewards
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
