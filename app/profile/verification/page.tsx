"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KYC_TIERS } from "@/app/lib/constants/kyc-tiers";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import BackButton from "@/components/ui/back-button";

export default function VerificationPage() {
  const { user, kycInfo } = useAuth();
  const currentTier = kycInfo?.currentTier ?? "unverified";
  const completedRequirements = kycInfo?.completedRequirements ?? [];

  const getVerificationProgress = () => {
    const totalRequirements = KYC_TIERS.tier3.requirements.length;
    const completed = completedRequirements.length;
    return (completed / totalRequirements) * 100;
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <BackButton />
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Verification Status</CardTitle>
                  <CardDescription>Complete verification to unlock more features</CardDescription>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Verification Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(getVerificationProgress())}%
                    </span>
                  </div>
                  <Progress value={getVerificationProgress()} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(KYC_TIERS).map(([key, tier]) => (
                    <Card key={key} className={currentTier === key ? "border-primary" : ""}>
                      <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span className={tier.color}>{tier.name}</span>
                          {currentTier === key && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              Current
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Requirements</h4>
                          <ul className="space-y-2">
                            {tier.requirements.map((req) => (
                              <li key={req} className="flex items-center text-sm">
                                {completedRequirements.includes(req) ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-300 mr-2" />
                                )}
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Limits</h4>
                          <ul className="space-y-1 text-sm">
                            <li>Daily: ₦{tier.dailyLimit.toLocaleString()}</li>
                            <li>Monthly: ₦{tier.monthlyLimit.toLocaleString()}</li>
                          </ul>
                        </div>

                        {key !== "unverified" && (
                          <Link href={`/profile/verification/${key}`}>
                            <Button className="w-full">
                              {currentTier === key ? "Complete Verification" : "Upgrade to " + tier.name}
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
