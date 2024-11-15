"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QuidaxService } from '@/app/lib/services/quidax';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TransactionStatusBadge } from '@/app/components/ui/transaction-status-badge';
import { TransactionStatus as TxStatus } from '@/app/types/transactions';

interface Props {
  transactionId: string;
}

export default function TransactionStatusView({ transactionId }: Props) {
  const [status, setStatus] = useState<TxStatus>('pending');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const transaction = await QuidaxService.checkPaymentStatus(transactionId);
        setStatus(transaction.status);

        if (transaction.status === 'completed') {
          toast({
            title: "Success",
            description: "Transaction completed successfully"
          });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus();

    return () => clearInterval(interval);
  }, [transactionId, router, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Status</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionStatusBadge status={status} />
      </CardContent>
    </Card>
  );
}