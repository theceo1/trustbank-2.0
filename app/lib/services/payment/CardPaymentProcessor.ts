import { BasePaymentProcessor, PaymentProcessorResult } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';
import { QuidaxService } from '../quidax';

export class CardPaymentProcessor extends BasePaymentProcessor {
  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    try {
      const quidaxResult = await QuidaxService.processPayment({
        ...trade,
        paymentMethod: 'card'
      });

      return {
        success: true,
        reference: quidaxResult.reference,
        status: 'pending',
        redirect_url: quidaxResult.payment_url,
        metadata: {
          provider: quidaxResult.provider,
          session_id: quidaxResult.session_id
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentProcessorResult> {
    const paymentDetails = await QuidaxService.getPaymentDetails(reference);
    return {
      success: paymentDetails.status === 'completed',
      status: QuidaxService.mapQuidaxStatus(paymentDetails.status),
      reference,
      metadata: {
        card_reference: paymentDetails.card_reference,
        authorization: paymentDetails.authorization
      }
    };
  }
}