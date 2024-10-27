'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/auth-helpers-nextjs";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => Promise<{ user: User | null; session: Session | null; } | undefined>;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
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

  const signUp = async (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.name,
            referral_code: metadata?.referralCode,
            referred_by: metadata?.referredBy,
            is_verified: false
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (data?.user) {
        // Create a profile record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              name: metadata?.name,
              referral_code: metadata?.referralCode,
              referred_by: metadata?.referredBy
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }

        toast({
          title: "Account created successfully",
          description: "Please check your email for verification.",
        });
        return data;
      }
    } catch (error: any) {
      console.error('Detailed signup error:', error);
      throw new Error(error.message || 'An error occurred during sign up');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Google sign-in failed",
        description: "An error occurred during sign-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    signUp,
    signInWithGoogle,
    signIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
