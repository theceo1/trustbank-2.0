// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import supabase from '@/lib/supabase/client';
import { validateReferralCode, generateReferralCode } from '@/utils/referral';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (
    email: string, 
    password: string, 
    fullName: string, 
    referralCode?: string
  ) => Promise<{
    user: User | null;
    error: Error | null;
  }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<{
    data: { url: string; provider: string } | null;
    error: Error | null;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    referralCode?: string
  ): Promise<{ user: User | null; error: Error | null }> => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              email: email,
              full_name: fullName,
              referral_code: generateReferralCode(),
              referred_by: referralCode || null,
            },
          ]);

        if (profileError) throw profileError;
      }

      return { user, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('An unknown error occurred') 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      return { 
        data: {
          url: data.url,
          provider: data.provider
        },
        error: null 
      };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Sign in failed",
        description: "Could not sign in with Google.",
        variant: "destructive",
      });
      return {
        data: null,
        error: error as Error
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      
      // Clear any local storage or state
      setUser(null);
      
      // Force a hard redirect to clear all state
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    logout: signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};