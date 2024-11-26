"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusStep } from './StatusStep';
import { TradeDetails } from '@/app/types/trade';
import { PaymentStatus } from '@/app/types/payment';
import { useToast } from '@/hooks/use-toast';
import { TradeStatusService } from '@/app/lib/services/tradeStatus';

interface PaymentProcessorProps {
  trade: TradeDetails;
  onComplete: () => void;
}

export function PaymentProcessor({ trade, onComplete }: PaymentProcessorProps) {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const statusToProgress = useMemo(() => ({
    initiated: 0,
    pending: 25,
    processing: 50,
    confirming: 75,
    completed: 100,
    failed: 0
  }), []);

  useEffect(() => {
    if (!trade.id) return;

    let cleanupFn: (() => void) | undefined;

    const initWatchStatus = async () => {
      cleanupFn = await TradeStatusService.watchStatus(
        trade.id,
        (newStatus) => {
          if (!statusToProgress.hasOwnProperty(newStatus)) return;
          
          setStatus(newStatus);
          setProgress(statusToProgress[newStatus]);

          if (newStatus === 'completed') {
            toast({
              id: "trade-completed",
              title: "Success",
              description: "Your trade has been processed successfully",
            });
            onComplete();
          } else if (newStatus === 'failed') {
            toast({
              id: "trade-failed",
              title: "Failed",
              description: "Trade processing failed. Please try again.",
              variant: "destructive"
            });
          }
        }
      );
    };

    initWatchStatus();

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [trade.id, onComplete, toast, statusToProgress]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-center">
            Processing Your {trade.type.toUpperCase()}
          </h3>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <StatusStep
            step={1}
            title="Payment Initiated"
            isComplete={status !== 'pending'}
          />
          <StatusStep
            step={2}
            title="Processing Payment"
            isComplete={['completed', 'processing', 'confirming'].includes(status)}
          />
          <StatusStep
            step={3}
            title="Trade Complete"
            isComplete={status === 'completed'}
          />
        </div>
      </CardContent>
    </Card>
  );
}