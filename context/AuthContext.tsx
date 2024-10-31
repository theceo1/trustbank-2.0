// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import supabase from '@/lib/supabase/client';
import { validateReferralCode } from '@/utils/referral';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => Promise<{
    data: { user: User | null; session: Session | null } | null;
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        router.refresh();
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: {
      name?: string;
      referralCode?: string;
      referredBy?: string | null;
    }
  ): Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: Error | null;
  }> => {
    try {
      if (metadata?.referralCode) {
        const isValid = await validateReferralCode(supabase, metadata.referralCode);
        if (!isValid) {
          throw new Error('Invalid referral code');
        }
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata?.name,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
        const newReferralCode = `REF${randomString}`;
        
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            full_name: metadata?.name,
            email: email,
            referral_code: newReferralCode,
            referred_by: metadata?.referralCode || null,
            is_verified: false,
            referral_count: 0
          })
          .select()
          .single();

        if (profileError) throw profileError;

        if (metadata?.referralCode) {
          const { error: updateError } = await supabase.rpc('increment_referral_count', {
            referral_code_param: metadata.referralCode
          });

          if (updateError) throw updateError;
        }
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error: error as Error };
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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
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