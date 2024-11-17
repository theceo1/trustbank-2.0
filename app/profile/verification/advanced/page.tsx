"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/back-button";
import { KYCAdvancedForm } from "@/app/components/verification/KYCAdvancedForm";

export default function AdvancedVerificationPage() {
  const { user, kycInfo, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && kycInfo) {
      // Check if user has completed intermediate tier
      if (kycInfo.currentTier !== "intermediate") {
        toast({
          title: "Complete Previous Tiers",
          description: "Please complete intermediate verification before proceeding",
          variant: "destructive",
        });
        router.push("/profile/verification");
        return;
      }
      
      // Prevent re-verification if already completed
      if (["advanced"].includes(kycInfo.currentTier)) {
        toast({
          title: "Already Verified",
          description: "You have already completed advanced verification",
          variant: "default",
        });
        router.push("/profile/verification");
      }
    }
  }, [kycInfo, loading, router, toast]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <BackButton />
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <KYCAdvancedForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}