"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import Link from "next/link";

interface VerificationTypeInfo {
  label: string;
  placeholder: string;
  helperText: string;
  pattern?: string;
}

const VERIFICATION_TYPES: Record<string, VerificationTypeInfo> = {
  bvn: {
    label: "Bank Verification Number (BVN)",
    placeholder: "Enter your 11-digit BVN",
    helperText: "Your 11-digit Bank Verification Number",
    pattern: "^[0-9]{11}$"
  },
  nin: {
    label: "National Identity Number (NIN)",
    placeholder: "Enter your 11-digit NIN",
    helperText: "Your 11-digit National Identity Number",
    pattern: "^[0-9]{11}$"
  },
  drivers_license: {
    label: "Driver's License",
    placeholder: "Enter your license number",
    helperText: "Your Driver's License number as shown on the card",
  },
  international_passport: {
    label: "International Passport",
    placeholder: "Enter your passport number",
    helperText: "Your passport number (e.g., A12345678)",
    pattern: "^[A-Z][0-9]{8}$"
  }
};

export default function VerificationPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationType, setVerificationType] = useState('bvn');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const validateVerificationId = (type: string, id: string): boolean => {
    const typeInfo = VERIFICATION_TYPES[type];
    if (!typeInfo.pattern) return true; // Skip validation if no pattern defined
    
    const regex = new RegExp(typeInfo.pattern);
    return regex.test(id);
  };

  const handleVerification = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      if (!verificationId) {
        throw new Error("Please enter your verification ID.");
      }

      if (!validateVerificationId(verificationType, verificationId)) {
        throw new Error(`Invalid ${VERIFICATION_TYPES[verificationType].label} format`);
      }

      // API call to verify the ID
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationType,
          data: {
            verificationId: verificationId.trim()
          }
        }),
      });

      const data = await response.json();

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
        });
      } else {
        throw new Error("The provided information could not be verified. Please check your details and try again.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during verification");
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
    <motion.div>
      <div className="w-full max-w-md mb-4">
        <Link href="/profile">
          <Button variant="ghost" className="text-green-600 hover:text-green-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2" /> Verification Status
          </CardTitle>
          <CardDescription>
            <i>Identity verification is required to unlock withdrawals.</i>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="mr-2" /> 
              <span>Your account is verified</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center text-red-500">
                <XCircle className="mr-2" /> 
                <span>Your account is not verified</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Verification Type</Label>
                  <Select onValueChange={setVerificationType} defaultValue={verificationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bvn">BVN</SelectItem>
                      <SelectItem value="nin">NIN</SelectItem>
                      <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                      <SelectItem value="international_passport">International Passport</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {VERIFICATION_TYPES[verificationType].helperText}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input
                    type="text"
                    placeholder={VERIFICATION_TYPES[verificationType].placeholder}
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleVerification} 
                  className="w-full bg-green-700 hover:bg-green-300 hover:text-black dark:bg-green-700 dark:text-black dark:hover:bg-green-300 dark:hover:text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Identity"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
