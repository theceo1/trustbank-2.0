"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { KYCInfo } from "@/app/types/kyc";

export interface AuthContextType {
  user: User | null;
  kycInfo: KYCInfo | null;
  signOut: () => Promise<void>;
  // ... other auth methods
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  kycInfo: null,
  signOut: async () => {},
  // ... other default values
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kycInfo, setKycInfo] = useState<AuthContextType['kycInfo'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, kycInfo, signOut: async () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);