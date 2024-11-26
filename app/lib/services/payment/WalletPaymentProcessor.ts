import { BasePaymentProcessor, PaymentProcessorResult } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';
import { WalletService } from '../wallet';
import { QuidaxService } from '../quidax';

export class WalletPaymentProcessor extends BasePaymentProcessor {
  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    try {
      await WalletService.processTradePayment(trade.user_id, trade);
      const quidaxResult = await QuidaxService.processWalletPayment(trade.quidax_reference!);

      return {
        success: true,
        reference: trade.id,
        status: 'pending',
        redirect_url: `/payment/${trade.id}`,
        metadata: { quidax_reference: quidaxResult.reference }
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentProcessorResult> {
    const quidaxStatus = await QuidaxService.getTradeStatus(reference);
    return {
      success: quidaxStatus === 'completed',
      status: QuidaxService.mapQuidaxStatus(quidaxStatus),
      reference
    };
  }
}