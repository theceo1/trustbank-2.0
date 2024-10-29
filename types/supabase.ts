// Supabase types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          full_name: string | null
          is_verified: boolean
          referral_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
        }
        Update: {
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
        }
      }
    }
  }
}
