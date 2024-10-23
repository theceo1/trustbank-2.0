"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export default function VerificationPage() {
  const [user, setUser] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsVerified(user.email_confirmed_at !== null);
      } else {
        router.push('/auth/login');
      }
    }
    getUser();
  }, [supabase, router]);

  const handleVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
      toast({
        title: "Verification email sent",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Verification failed",
        description: "An error occurred while sending the verification email. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2" /> Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            {isVerified ? (
              <><CheckCircle className="text-green-600 mr-2" /> Your account is verified</>
            ) : (
              <><XCircle className="text-red-500 mr-2" /> Your account is not verified</>
            )}
          </div>
          {!isVerified && (
            <Button onClick={handleVerification} className="w-full">
              Resend Verification Email
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}