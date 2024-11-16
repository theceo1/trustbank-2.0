"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BackButton from "@/components/ui/back-button";

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
    pattern: "^\\d{11}$"
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
    pattern: "^[A-Z0-9-]+$"
  },
  international_passport: {
    label: "International Passport",
    placeholder: "Enter your passport number",
    helperText: "Your passport number (e.g., A12345678)",
    pattern: "^[A-Z][0-9]{8}$"
  }
};

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  // Add more countries as needed
];

export default function VerificationPage() {
  const [verificationId, setVerificationId] = useState('');
  const [verificationType, setVerificationType] = useState('bvn');
  const [country, setCountry] = useState('NG'); // Default to Nigeria
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  const validateVerificationId = (type: string, id: string): boolean => {
    const typeInfo = VERIFICATION_TYPES[type];
    if (!typeInfo.pattern) return true; // Skip validation if no pattern defined
    
    const regex = new RegExp(typeInfo.pattern);
    return regex.test(id);
  };

  const handleVerification = async () => {
    setIsLoading(true);
    
    try {
      if (!verificationId) {
        throw new Error("Please enter your verification ID.");
      }

      if (!validateVerificationId(verificationType, verificationId)) {
        if (verificationType === 'bvn') {
          throw new Error("BVN must be exactly 11 digits long");
        } else {
          throw new Error(`Invalid ${VERIFICATION_TYPES[verificationType].label} format`);
        }
      }

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationType,
          data: {
            verificationId: verificationId.trim(),
            country
          }
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.entity?.verified) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            is_verified: true,
            verification_type: verificationType,
            verification_date: new Date().toISOString(),
            verification_details: data.entity
          }
        });

        if (updateError) throw updateError;

        toast({
          title: "Verification Successful",
          description: "Your identity has been verified successfully.",
        });
        
        router.push('/dashboard');
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
      className="container mx-auto p-4 sm:p-6 lg:p-8 mt-14 flex flex-col min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BackButton />
      <div className="flex items-center justify-center flex-grow">
        <Card className="shadow-lg rounded-lg w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Verify Your Identity</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Please select your verification type and enter your ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Country</Label>
                <Select onValueChange={setCountry} defaultValue={country}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
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

              <div>
                <Label>ID Number</Label>
                <Input
                  type="text"
                  placeholder={VERIFICATION_TYPES[verificationType].placeholder}
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                />
              </div>

              <Button onClick={handleVerification} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-300 text-white dark:bg-green-600 dark:hover:bg-green-300 transition duration-200">
                {isLoading ? <Loader2 className="animate-spin" /> : "Verify"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
