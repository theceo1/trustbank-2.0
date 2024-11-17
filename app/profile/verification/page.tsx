"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/back-button";
import { motion } from "framer-motion";
import { KYC_TIERS } from "@/app/lib/constants/kyc-tiers";
import { Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function VerificationPage() {
  const router = useRouter();
  const { kycInfo } = useAuth();
  
  const tiers = [
    {
      key: "tier1",
      name: "Tier 1 - Basic",
      description: "Start with basic verification to access essential features",
      requirements: ["Valid NIN (National Identity Number)"],
      limits: KYC_TIERS.tier1,
      route: "/profile/verification/nin",
      requiredDocs: ["nin"]
    },
    {
      key: "tier2",
      name: "Tier 2 - Intermediate",
      description: "Unlock higher limits and more features",
      requirements: ["Valid BVN (Bank Verification Number)"],
      limits: KYC_TIERS.tier2,
      route: "/profile/verification/bvn",
      requiredDocs: ["bvn"]
    },
    {
      key: "tier3",
      name: "Tier 3 - Advanced",
      description: "Maximum limits and full platform access",
      requirements: ["International Passport", "or", "Driver's License"],
      limits: KYC_TIERS.tier3,
      route: "/profile/verification/id",
      requiredDocs: ["international_passport", "drivers_license"]
    }
  ];

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Choose Your Verification Level</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <Card 
                key={tier.key}
                className={`relative ${kycInfo?.currentTier === tier.key ? 'border-green-500' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {kycInfo?.currentTier === tier.key && (
                      <span className="text-xs font-medium text-green-500">Current Tier</span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm space-y-1">
                      {tier.requirements.map((req) => (
                        <li key={req} className="flex items-center gap-2">
                          {req === "or" ? (
                            <span className="text-muted-foreground ml-4">{req}</span>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-muted-foreground" />
                              {req}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Transaction Limits:</h4>
                    <ul className="text-sm space-y-1">
                      <li>Daily: ₦{tier.limits.dailyLimit.toLocaleString()}</li>
                      <li>Monthly: ₦{tier.limits.monthlyLimit.toLocaleString()}</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => router.push(tier.route)}
                    className="w-full mt-4"
                    variant={kycInfo?.currentTier === tier.key ? "outline" : "default"}
                    disabled={
                      (tier.key === "tier2" && kycInfo?.currentTier === "unverified") ||
                      (tier.key === "tier3" && kycInfo?.currentTier !== "tier2") ||
                      kycInfo?.currentTier === tier.key
                    }
                  >
                    {kycInfo?.currentTier === tier.key ? (
                      "Already Verified"
                    ) : (
                      <>
                        Proceed to Verification
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
