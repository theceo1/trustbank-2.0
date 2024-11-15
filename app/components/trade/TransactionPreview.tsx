import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PaymentMethodType, PAYMENT_METHODS, PLATFORM_FEES } from '@/app/types/payment';
import { formatCurrency } from '@/app/lib/utils';
import { Loader2 } from 'lucide-react';
import { FeeService } from '@/app/lib/services/fees';

interface TransactionPreviewProps {
  type: 'buy' | 'sell';
  amount: number;
  cryptoAmount: number;
  cryptoCurrency: string;
  rate: number;
  paymentMethod: PaymentMethodType;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function TransactionPreview({
  amount,
  cryptoAmount,
  cryptoCurrency,
  rate,
  paymentMethod,
  type,
  onConfirm,
  onCancel,
  isLoading = false,
}: TransactionPreviewProps) {
  const fees = useMemo(() => 
    FeeService.calculateTradeFees(amount, paymentMethod),
    [amount, paymentMethod]
  );

  const formattedFees = useMemo(() => 
    FeeService.formatFeeBreakdown(fees),
    [fees]
  );

  const total = useMemo(() => {
    return type === 'buy' ? amount + fees.total : amount - fees.total;
  }, [amount, fees.total, type]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Transaction Preview</CardTitle>
        <CardDescription>
          Please review your {type} order details
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Amount</span>
            <span className="font-medium">
              {formatCurrency(amount, 'NGN')}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Crypto Amount</span>
            <span className="font-medium">
              {cryptoAmount} {cryptoCurrency}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Rate</span>
            <span className="font-medium">
              {formatCurrency(rate, 'NGN')}/{cryptoCurrency}
            </span>
          </div>

          <Separator className="my-2" />

          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Exchange Fee</span>
              <span>{formattedFees.quidax}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Service Fee</span>
              <span>{formattedFees.platform}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing Fee</span>
              <span>{formattedFees.processing}</span>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-medium">
            <span>Total {type === 'buy' ? 'Pay' : 'Receive'}</span>
            <span className="text-lg">
              {formatCurrency(total, 'NGN')}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            `Confirm ${type}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}