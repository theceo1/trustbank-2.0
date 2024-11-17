"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import BackButton from "@/components/ui/back-button";
import { KYCService } from "@/app/lib/services/kyc";
import { useAuth } from "@/context/AuthContext";

export default function NINVerificationPage() {
  const [nin, setNin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await KYCService.verifyNIN(user?.id as string, nin);
      toast({
        title: "Success",
        description: "NIN verification successful. You have been upgraded to Tier 1.",
      });
      router.push("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify NIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle>NIN Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter your 11-digit NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  pattern="^[0-9]{11}$"
                  required
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Please enter your 11-digit National Identity Number
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify NIN"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}