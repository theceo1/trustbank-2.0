// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import supabase from '@/lib/supabase/client';

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
    data: { user: User | null; session: Session | null } | null; 
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
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata?.name,
            referralCode: metadata?.referralCode,
            referredBy: metadata?.referredBy,
          }
        }
      });
      
      return { 
        data: { user: data.user, session: data.session }, 
        error: null 
      };
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Sign up failed",
        description: "An error occurred during sign up.",
        variant: "destructive",
      });
      return { 
        data: null, 
        error: error as Error 
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

      // signInWithOAuth returns { data: { provider, url }, error }
      // We should handle the redirect case
      if (error) throw error;
      
      // For OAuth, we don't get user/session immediately as it redirects
      return { 
        data: null,
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