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
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  kycInfo: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kycInfo, setKycInfo] = useState<KYCInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const kycData = await KYCService.getUserKYCInfo(currentUser.id);
          setKycInfo(kycData);
        } else {
          setKycInfo(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setKycInfo(null);
  };

  return (
    <AuthContext.Provider value={{ user, kycInfo, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);