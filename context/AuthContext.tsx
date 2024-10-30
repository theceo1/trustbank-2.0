'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
// import { Session, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import supabase from '@/lib/supabase/client';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata: {
    name: string;
    referralCode: string;
    referredBy: string | null;
  }) => Promise<{ user: User | null; session: Session | null; } | void>;
  signInWithGoogle: () => Promise<{
    data: { provider: string; url: string | null } | null;
    error: Error | null;
  }>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: {
    name: string;
    referralCode: string;
    referredBy: string | null;
  }) => {
    try {
      const { data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.name,
            referral_code: metadata.referralCode,
            is_verified: false
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

    

      // Create profile after successful signup
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: data.user.id,
            full_name: metadata.name,
            is_verified: false,
            referral_code: metadata.referralCode,
            referred_by: metadata.referredBy
          }, {
            onConflict: 'user_id',  // Specify the column that might conflict
            ignoreDuplicates: false // Update existing record if found
          });

        if (profileError) throw profileError;
      }

      toast({
        title: "Sign up successful",
        description: "Please check your email to verify your account.",
      });

      return data;  // This return is now type-safe
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "An error occurred during sign up",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      return { 
        data: data ? { provider: data.provider, url: data.url } : null, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signUp,
      signInWithGoogle,
      signIn,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
