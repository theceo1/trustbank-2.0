// app/components/profile/KYCTierInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYC_TIERS } from "@/app/lib/constants/kyc-tiers";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface KYCTierInfoProps {
  currentTier: string;
  verificationStatus: string;
  completedRequirements?: string[];
}

export function KYCTierInfo({ currentTier, verificationStatus, completedRequirements = [] }: KYCTierInfoProps) {
  const tier = KYC_TIERS[currentTier as keyof typeof KYC_TIERS];
  const nextTier = getNextTier(currentTier);
  
  const getVerificationRoute = () => {
    // Map current tier to next required verification route
    const tierRoutes = {
      unverified: '/profile/verification/nin',  // Basic/Tier1 verification
      tier1: '/profile/verification/bvn',       // Intermediate/Tier2 verification
      tier2: '/profile/verification/id'         // Advanced/Tier3 verification
    };

    return tierRoutes[currentTier as keyof typeof tierRoutes] || '/profile/verification';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Verification Status: {verificationStatus}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Current Tier: {currentTier.toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground">
                Daily Limit: ₦{tier.dailyLimit.toLocaleString()}<br />
                Monthly Limit: ₦{tier.monthlyLimit.toLocaleString()}
              </p>
            </div>
            
            {nextTier && (
              <div>
                <h4 className="text-sm font-medium">Requirements for {nextTier.name}</h4>
                <ul className="mt-2 space-y-2">
                  {nextTier.requirements.map((req) => (
                    <li key={req} className="flex items-center text-sm">
                      {completedRequirements.includes(req) ? "✓" : "○"} {req}
                    </li>
                  ))}
                </ul>
                {nextTier.key !== "unverified" && (
                  <Link href={getVerificationRoute()}>
                    <Button 
                      className="w-full"
                      disabled={
                        currentTier === nextTier.key ||
                        (nextTier.key === "tier2" && currentTier === "unverified") ||
                        (nextTier.key === "tier3" && currentTier !== "tier2")
                      }
                    >
                      {currentTier === nextTier.key ? "Already Verified" : "Upgrade to " + nextTier.name}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getNextTier(currentTier: string) {
  const tiers = Object.entries(KYC_TIERS);
  const currentIndex = tiers.findIndex(([key]) => key === currentTier);
  if (currentIndex < tiers.length - 1) {
    const nextTierKey = tiers[currentIndex + 1][0];
    return {
      key: nextTierKey,
      ...KYC_TIERS[nextTierKey as keyof typeof KYC_TIERS]
    };
  }
  return null;
}