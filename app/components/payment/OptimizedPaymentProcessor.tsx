import { Suspense, lazy } from 'react';
import { usePaymentOptimization } from '@/app/hooks/usePaymentOptimization';
import { PaymentLoadingState } from '../ui/loading/PaymentLoadingState';
import { PaymentProcessorProps } from '@/app/types/payment';

// Lazy load payment method components
const WalletPayment = lazy(() => import('./methods/WalletPayment'));
const CardPayment = lazy(() => import('./methods/CardPayment'));
const BankTransferPayment = lazy(() => import('./methods/BankTransferPayment'));

export function OptimizedPaymentProcessor({
  trade,
  onComplete
}: PaymentProcessorProps) {
  const { isOptimized, avgProcessingTime } = usePaymentOptimization(
    trade.paymentMethod
  );

  const PaymentComponent = {
    wallet: WalletPayment,
    card: CardPayment,
    bank_transfer: BankTransferPayment
  }[trade.paymentMethod] as React.ComponentType<any>;

    function formatTime(avgProcessingTime: number): import("react").ReactNode {
        throw new Error('Function not implemented.');
    }

  return (
    <div className="space-y-4">
      {avgProcessingTime && (
        <div className="text-sm text-gray-500 text-center">
          Estimated processing time: {formatTime(avgProcessingTime)}
        </div>
      )}

      <Suspense fallback={<PaymentLoadingState />}>
        <PaymentComponent
          trade={trade}
          onComplete={onComplete}
          isOptimized={isOptimized}
        />
      </Suspense>

      <div className="text-center">
        <small className="text-gray-500">
          Secured by trustBank&apos;s Advanced Payment System
        </small>
      </div>
    </div>
  );
}