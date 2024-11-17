"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/back-button";
import { motion } from "framer-motion";
import { KYC_TIERS } from "@/app/lib/constants/kyc-tiers";

export default function VerificationPage() {
  const router = useRouter();

  return (
    <div className="container max-w-md mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Choose Verification Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/profile/verification/nin')}
              className="w-full"
            >
              Tier 1 - Basic Verification
            </Button>
            <Button
              onClick={() => router.push('/profile/verification/bvn')}
              className="w-full"
            >
              Tier 2 - Intermediate Verification
            </Button>
            <Button
              onClick={() => router.push('/profile/verification/id')}
              className="w-full"
            >
              Tier 3 - Advanced Verification
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
