import { Session, User } from "@supabase/supabase-js";

export interface UserProfile {
    user_id: string;
    email: string;
    name?: string;
    referral_code: string;
    created_at: string;
  }

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => Promise<{ user: User | null; session: Session | null; } | void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}
