import { FEES } from '../constants/fees';
import { PaymentMethodType } from '@/app/types/payment';

export class FeeService {
  static calculateTradeFees(amount: number, paymentMethod: PaymentMethodType) {
    const quidaxFee = amount * FEES.platform.quidax;
    const platformFee = amount * FEES.platform.service;
    const paymentFees = FEES.payment[paymentMethod as keyof typeof FEES.payment];
    const processingFee = paymentFees.fixed + (amount * paymentFees.percentage);

    return {
      quidax: quidaxFee,
      platform: platformFee,
      processing: processingFee,
      total: quidaxFee + platformFee + processingFee,
      breakdown: {
        quidaxPercentage: FEES.platform.quidax * 100,
        platformPercentage: FEES.platform.service * 100,
        processingPercentage: paymentFees.percentage * 100,
        processingFixed: paymentFees.fixed
      }
    };
  }

  static formatFeeBreakdown(fees: ReturnType<typeof this.calculateTradeFees>) {
    return {
      quidax: `${fees.breakdown.quidaxPercentage}% (₦${fees.quidax.toLocaleString()})`,
      platform: `${fees.breakdown.platformPercentage}% (₦${fees.platform.toLocaleString()})`,
      processing: `${fees.breakdown.processingPercentage}% + ₦${fees.breakdown.processingFixed} (₦${fees.processing.toLocaleString()})`,
      total: `₦${fees.total.toLocaleString()}`
    };
  }
}