import { TradeDetails } from '@/app/types/trade';
import { PaymentService } from './payment';
import { QuidaxService } from './quidax';
import { WalletService } from './wallet';
import { PaymentMethodType } from '@/app/types/payment';

export class PaymentProcessor {
  static async initializePayment(trade: TradeDetails) {
    if (trade.status !== 'pending') {
      throw new Error('Invalid trade status');
    }

    const method = await PaymentService.getPaymentMethod(trade.paymentMethod as PaymentMethodType);
    const fees = PaymentService.calculateFees(trade.amount, method);

    switch (trade.paymentMethod) {
      case 'wallet':
        return await this.processWalletPayment(trade);
      case 'bank':
      case 'card':
        return await this.processExternalPayment(trade);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  private static async processWalletPayment(trade: TradeDetails) {
    const balance = await WalletService.getUserBalance(trade.user_id);
    if (balance < trade.total) {
      throw new Error('Insufficient wallet balance');
    }

    await WalletService.updateBalance(trade.user_id, -trade.total);
    return QuidaxService.processWalletPayment(trade.quidax_reference);
  }

  private static async processExternalPayment(trade: TradeDetails) {
    const paymentDetails = await QuidaxService.getPaymentDetails(trade.quidax_reference);
    return {
      payment_url: paymentDetails.payment_url,
      reference: paymentDetails.reference
    };
  }
}