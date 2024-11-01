"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log('Starting email verification...');
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        console.log('Verification params:', { token, type });

        if (type === "signup" && token) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup",
          });

          if (error) {
            console.error('Verification error:', error);
            toast({
              title: "Verification failed",
              description: error.message,
              variant: "destructive",
            });
            router.push("/auth/login");
            return;
          }

          console.log('Email verified successfully');
          toast({
            title: "Email verified",
            description: "You can now log in with your account",
          });
          router.push("/auth/login");
        } else {
          console.log('No verification token found, redirecting to login');
          router.push("/auth/login");
        }
      } catch (error) {
        console.error('Verification process error:', error);
        toast({
          title: "Verification failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/auth/login");
      }
    };

    verifyEmail();
  }, [router, searchParams, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
        <p>Please wait while we verify your email address.</p>
      </div>
    </div>
  );
}