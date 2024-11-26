import { useState, useEffect } from 'react';
import { useOptimisticUpdate } from '@/app/hooks/useOptimisticUpdate';
import { PaymentProcessor } from '@/app/lib/services/paymentProcessor';
import { TransactionSummary } from './TransactionSummary';
import PaymentStatus from './PaymentStatus';
import { PaymentResult, PaymentStatus as PaymentStatusType } from '@/app/types/payment';
import { TradeDetails } from '@/app/types/trade';

interface OptimisticPaymentFlowProps {
  trade: TradeDetails;
  onComplete: (result: PaymentResult) => void;
}

export function OptimisticPaymentFlow({ trade, onComplete }: OptimisticPaymentFlowProps) {
  const [status, setStatus] = useState<PaymentStatusType>('initiated');
  
  const { mutate, isLoading, error } = useOptimisticUpdate<PaymentResult>({
    mutationFn: async () => {
      return await PaymentProcessor.initializePayment(trade);
    },
    optimisticData: {
      status: 'processing',
      trade_id: trade.id!,
      reference: trade.reference
    },
    onSuccess: (data: PaymentResult) => {
      setStatus('completed');
      onComplete(data);
    },
    onError: () => {
      setStatus('failed');
    }
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="space-y-6">
      <TransactionSummary 
        trade={trade}
        isLoading={isLoading}
      />

      <PaymentStatus
        status={status}
        amount={trade.amount}
        currency={trade.currency}
        isLoading={isLoading}
        error={error}
        onRetry={() => mutate()}
      />

      <div className="text-center text-sm text-gray-500">
        <p>Protected by TrustBank&apos;s Secure Payment System</p>
      </div>
    </div>
  );
}