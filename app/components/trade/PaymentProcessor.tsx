import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { TradeReceipt } from './TradeReceipt';
import { QuidaxService } from '@/app/lib/services/quidax';
import { useToast } from '@/hooks/use-toast';
import { TradeDetails } from '@/app/types/trade';
import { TradeStatus } from './TradeStatus';

interface PaymentProcessorProps {
  trade: TradeDetails;
  onComplete: () => void;
}

export function PaymentProcessor({ trade, onComplete }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!trade.quidax_reference) return;
      
      try {
        const details = await QuidaxService.getPaymentDetails(trade.quidax_reference);
        setPaymentDetails(details);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch payment details',
          variant: 'destructive'
        });
      }
    };

    fetchPaymentDetails();
  }, [trade.quidax_reference, toast]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (trade.payment_method === 'wallet') {
        // Handle wallet payment
        await QuidaxService.processWalletPayment(trade.id);
        setIsComplete(true);
        onComplete();
      } else if (paymentDetails?.payment_url) {
        // Redirect to payment URL
        window.location.href = paymentDetails.payment_url;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Payment processing failed',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === 'completed') {
      setIsComplete(true);
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <TradeReceipt trade={trade} />
      <TradeStatus tradeId={trade.id} onStatusChange={handleStatusChange} />
      
      {!isComplete && paymentDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentDetails.bank_details && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bank Name</span>
                  <span className="font-medium">{paymentDetails.bank_details.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <span className="font-medium">{paymentDetails.bank_details.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <span className="font-medium">{paymentDetails.bank_details.account_name}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">Payment Complete</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your trade has been processed successfully
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}