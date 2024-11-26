import { BasePaymentProcessor, PaymentProcessorResult } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';
import { QuidaxService } from '../quidax';

export class BankTransferProcessor extends BasePaymentProcessor {
  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    try {
      const quidaxResult = await QuidaxService.processPayment({
        ...trade,
        paymentMethod: 'bank_transfer'
      });

      return {
        success: true,
        reference: quidaxResult.reference,
        status: 'pending',
        redirect_url: quidaxResult.payment_url,
        metadata: {
          bank_details: quidaxResult.bank_details,
          expires_at: quidaxResult.expires_at
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
        payment_proof: paymentDetails.payment_proof,
        bank_reference: paymentDetails.bank_reference
      }
    };
  }
}