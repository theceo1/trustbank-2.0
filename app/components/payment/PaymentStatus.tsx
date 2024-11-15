"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuidaxService } from '@/app/lib/services/quidax';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionStatusBadge } from "@/app/components/ui/transaction-status-badge";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentStatusProps {
  reference: string;
  transactionId: string;
}

export default function PaymentStatus({ reference, transactionId }: PaymentStatusProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const status = await QuidaxService.getTransactionStatus(reference);
        setStatus(status.status);

        if (status.status !== 'pending') {
          setIsPolling(false);
          
          // Update transaction status in database
          await QuidaxService.updateTransactionStatus(transactionId, status);

          if (status.status === 'completed') {
            toast({
              title: "Success",
              description: "Your transaction has been completed successfully.",
              variant: "default",
            });
            setTimeout(() => router.push('/dashboard'), 2000);
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setIsPolling(false);
      }
    };

    if (isPolling) {
      const interval = setInterval(pollStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [reference, transactionId, isPolling, router, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'pending' && (
          <Alert>
            <TransactionStatusBadge status="pending" />
            <AlertDescription>
              Processing your payment. Please wait...
            </AlertDescription>
          </Alert>
        )}

        {status === 'completed' && (
          <Alert className="bg-green-50 border-green-200">
            <TransactionStatusBadge status="completed" />
            <AlertDescription className="text-green-700">
              Payment completed successfully!
            </AlertDescription>
          </Alert>
        )}

        {status === 'failed' && (
          <Alert variant="destructive">
            <TransactionStatusBadge status="failed" />
            <AlertDescription>
              Payment failed. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={() => router.push('/dashboard')}
          variant="outline" 
          className="w-full"
        >
          Return to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}