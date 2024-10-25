"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VerificationPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationType, setVerificationType] = useState('bvn');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Check Supabase verification status on load
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.is_verified) {
        setIsVerified(true);
      }
    };
    checkVerificationStatus();
  }, [supabase.auth]);

  const handleVerification = async () => {
    setIsLoading(true);
    try {
      if (!verificationId) {
        toast({
          title: "Validation Error",
          description: "Please enter your verification ID.",
          variant: "destructive",
        });
        return;
      }

      // Use test BVN for sandbox: 10000000001
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationType,
          data: {
            verificationId: verificationId.trim() // Remove any whitespace
          }
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.entity?.verified) {
        // Update Supabase user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            is_verified: true,
            verification_type: verificationType,
            verification_date: new Date().toISOString(),
            verification_details: data.entity
          }
        });

        if (updateError) throw updateError;

        setIsVerified(true);
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified successfully.",
          variant: "default",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "The provided information could not be verified. Please check your details and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center mb-6">
            {isVerified ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2" /> 
                <span>Your account is verified</span>
              </div>
            ) : (
              <>
                <div className="flex items-center text-red-500 mb-4">
                  <XCircle className="mr-2" /> 
                  <span>Your account is not verified</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Type</label>
                    <Select onValueChange={setVerificationType} defaultValue={verificationType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bvn">BVN</SelectItem>
                        <SelectItem value="nin">NIN</SelectItem>
                        <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">ID Number</label>
                    <Input
                      type="text"
                      placeholder="Enter your ID number"
                      value={verificationId}
                      onChange={(e) => setVerificationId(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleVerification} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify Identity"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
