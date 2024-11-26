import { TradeDetails } from '@/app/types/trade';

export interface PaymentProcessorResult {
  success: boolean;
  redirect_url?: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export abstract class BasePaymentProcessor {
  abstract process(trade: TradeDetails): Promise<PaymentProcessorResult>;
  abstract verifyPayment(reference: string): Promise<PaymentProcessorResult>;
}