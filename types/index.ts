export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    referralCode: string;
    referredBy?: string;
    created_at: string;
  }

export interface AuthContextType {
  user: any | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
}
