"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { KYCService } from "@/app/lib/services/kyc";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const advancedFormSchema = z.object({
  occupation: z.string().min(2, "Please enter your occupation"),
  employerName: z.string().min(2, "Please enter your employer's name"),
  annualIncome: z.string().min(1, "Please enter your annual income"),
  sourceOfFunds: z.string().min(10, "Please describe your source of funds"),
  bankStatement: z.instanceof(File, { message: "Please upload your bank statement" }),
  employmentLetter: z.instanceof(File, { message: "Please upload your employment letter" }),
});

type AdvancedFormValues = z.infer<typeof advancedFormSchema>;

export function KYCAdvancedForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<AdvancedFormValues>({
    resolver: zodResolver(advancedFormSchema),
  });

  const onSubmit = async (data: AdvancedFormValues) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      // Handle file uploads
      const bankStatementUrl = await KYCService.uploadDocument(data.bankStatement);
      const employmentLetterUrl = await KYCService.uploadDocument(data.employmentLetter);

      await KYCService.submitAdvancedVerification(user.id, {
        ...data,
        bankStatementUrl,
        employmentLetterUrl,
        tier: "advanced",
      });

      toast({
        title: "Verification Submitted",
        description: "Your advanced verification is being processed.",
      });
      
      router.push("/profile/verification");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your occupation" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employer Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your employer's name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="annualIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Income</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Enter your annual income" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceOfFunds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source of Funds</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Please describe your source of funds"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankStatement"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Upload Bank Statement (Last 3 months)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                    {...field}
                  />
                  <Upload className="h-4 w-4" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employmentLetter"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Upload Employment Letter</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                    {...field}
                  />
                  <Upload className="h-4 w-4" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Advanced Verification
        </Button>
      </form>
    </Form>
  );
}