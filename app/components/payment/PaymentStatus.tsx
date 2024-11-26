"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuidaxService } from '@/app/lib/services/quidax';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrustBankLogo } from '@/app/components/brand/TrustBankLogo';
import type { PaymentStatusProps, PaymentStatus as PaymentStatusType } from '@/app/types/payment';
import { formatCurrency } from '@/app/utils/formatCurrency';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusConfig {
  icon: React.ReactNode;
  message: string;
  color: string;
}

const getStatusConfig = (status: PaymentStatusType): StatusConfig => {
  const configs: Record<PaymentStatusType, StatusConfig> = {
    completed: {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      message: 'Payment Successful',
      color: 'text-green-500'
    },
    failed: {
      icon: <XCircle className="h-6 w-6 text-red-500" />,
      message: 'Payment Failed',
      color: 'text-red-500'
    },
    pending: {
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      message: 'Processing Payment',
      color: 'text-yellow-500'
    },
    processing: {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      message: 'Processing Payment',
      color: 'text-blue-500'
    },
    initiated: {
      icon: <Clock className="h-6 w-6 text-gray-500" />,
      message: 'Initiating Payment',
      color: 'text-gray-500'
    },
    confirming: {
      icon: <Clock className="h-6 w-6 text-purple-500" />,
      message: 'Confirming Payment',
      color: 'text-purple-500'
    }
  };

  return configs[status] || configs.pending;
};

export default function PaymentStatus({ 
  status,
  amount,
  currency,
  reference,
  transactionId,
  isLoading,
  error,
  onRetry
}: PaymentStatusProps) {
  const router = useRouter();
  const { toast } = useToast();
  const config = getStatusConfig(status);

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <TrustBankLogo className="h-8 w-auto" />
          <span className="text-sm opacity-75">Secure Payment</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            {formatCurrency(amount, currency)}
          </h3>
          <Progress 
            value={status === 'completed' ? 100 : status === 'pending' ? 50 : 0}
            className="h-2"
          />
          <div className="flex items-center justify-center space-x-2">
            {config.icon}
            <span className={config.color}>{config.message}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}