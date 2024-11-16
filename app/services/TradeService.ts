import supabase from '@/lib/supabase/client';
import { KYCService } from '@/app/lib/services/kyc';
import { TransactionLimitService } from '@/app/lib/services/transactionLimits';

interface TradeParams {
  userId: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
}

export class TradeService {
  static async executeTrade({
    userId,
    type,
    currency,
    amount,
    rate
  }: TradeParams) {
    // Validate KYC status
    const kycStatus = await KYCService.isEligibleForTrade(userId);
    if (!kycStatus.eligible) {
      throw new Error(kycStatus.reason);
    }

    // Validate transaction limits
    const limitValidation = TransactionLimitService.validateCryptoAmount(
      currency,
      amount
    );
    if (!limitValidation.valid) {
      throw new Error(limitValidation.reason);
    }

    // Create trade record
    const { data, error } = await supabase
      .from('trades')
      .insert({
        user_id: userId,
        type,
        currency,
        amount,
        rate,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}