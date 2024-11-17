"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { KYCInfo } from "@/app/types/kyc";
import { KYCService } from "@/app/lib/services/kyc";

export interface AuthContextType {
  user: User | null;
  kycInfo: KYCInfo | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  kycInfo: null,
  signOut: async () => {},
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kycInfo, setKycInfo] = useState<KYCInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const kycData = await KYCService.getUserKYCInfo(currentUser.id);
          setKycInfo(kycData);
        } catch (error) {
          console.error('Error fetching KYC info:', error);
          setKycInfo(null);
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const kycData = await KYCService.getUserKYCInfo(currentUser.id);
            setKycInfo(kycData);
          } catch (error) {
            console.error('Error fetching KYC info:', error);
            setKycInfo(null);
          }
        } else {
          setKycInfo(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setKycInfo(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    kycInfo,
    signOut,
    loading,
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};