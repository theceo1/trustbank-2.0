import supabase from '@/lib/supabase/client';
import { handleError } from '@/app/lib/utils/errorHandler';
import { KYCService } from '@/app/lib/services/kyc';
import { KYC_TIERS } from '@/app/lib/constants/kyc-tiers';


interface TransactionLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
}

interface CryptoLimits {
  [key: string]: {
    min: number;
  };
}

const CRYPTO_LIMITS: CryptoLimits = {
  BTC: {
    min: 0.0001
  }
  // Other crypto limits will be added when confirmed
};

export class TransactionLimitService {
  private static readonly DAILY_LIMIT = 5000000; // 5M NGN
  private static readonly MIN_AMOUNT = 1000; // 1K NGN
  private static readonly MAX_AMOUNT = 2000000; // 2M NGN per transaction

  static async getLimits(userId: string): Promise<TransactionLimits> {
    try {
      const { data: userTier } = await supabase
        .from('user_tiers')
        .select('tier')
        .eq('user_id', userId)
        .single();

      // Default limits based on tier
      switch (userTier?.tier) {
        case 'premium':
          return {
            minAmount: 1000,
            maxAmount: 10000000,
            dailyLimit: 5000000,
            monthlyLimit: 50000000,
          };
        case 'verified':
          return {
            minAmount: 1000,
            maxAmount: 1000000,
            dailyLimit: 500000,
            monthlyLimit: 5000000,
          };
        default:
          return {
            minAmount: 1000,
            maxAmount: 100000,
            dailyLimit: 50000,
            monthlyLimit: 500000,
          };
      }
    } catch (error) {
      handleError(error, 'Failed to fetch transaction limits');
      throw error;
    }
  }

  static async validateAmount(userId: string, amount: number): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    try {
      const limits = await this.getLimits(userId);

      if (amount < limits.minAmount) {
        return {
          valid: false,
          reason: `Minimum transaction amount is ₦${limits.minAmount.toLocaleString()}`,
        };
      }

      if (amount > limits.maxAmount) {
        return {
          valid: false,
          reason: `Maximum transaction amount is ₦${limits.maxAmount.toLocaleString()}`,
        };
      }

      // Check daily limit
      const dailyTotal = await this.getDailyTotal(userId);
      if (dailyTotal + amount > limits.dailyLimit) {
        return {
          valid: false,
          reason: `Daily transaction limit of ₦${limits.dailyLimit.toLocaleString()} exceeded`,
        };
      }

      // Check monthly limit
      const monthlyTotal = await this.getMonthlyTotal(userId);
      if (monthlyTotal + amount > limits.monthlyLimit) {
        return {
          valid: false,
          reason: `Monthly transaction limit of ₦${limits.monthlyLimit.toLocaleString()} exceeded`,
        };
      }

      return { valid: true };
    } catch (error) {
      handleError(error, 'Failed to validate transaction amount');
      throw error;
    }
  }

  private static async getDailyTotal(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());

    return data?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0;
  }

  private static async getMonthlyTotal(userId: string): Promise<number> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString());

    return data?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0;
  }

  static validateCryptoAmount(cryptoCurrency: string, amount: number): {
    valid: boolean;
    reason?: string;
  } {
    const limits = CRYPTO_LIMITS[cryptoCurrency.toUpperCase()];
    if (!limits) return { valid: true }; // No confirmed limits for this crypto yet

    if (amount < limits.min) {
      return {
        valid: false,
        reason: `Minimum ${cryptoCurrency.toUpperCase()} amount is ${limits.min}`,
      };
    }

    return { valid: true };
  }

  static async getDailyTradeVolume(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      return data?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0;
    } catch (error) {
      handleError(error, 'Failed to calculate daily trade volume');
      return 0;
    }
  }

  static async validateTransaction(userId: string, amount: number): Promise<{ valid: boolean; reason?: string }> {
    const kycInfo = await KYCService.getKYCInfo(userId);
    const tierLimits = KYC_TIERS[kycInfo.currentTier];
    
    // Get user's transaction history for the day/month/year
    const dailyTotal = await this.getDailyTotal(userId);
    const monthlyTotal = await this.getMonthlyTotal(userId);
    
    if (dailyTotal + amount > tierLimits.dailyLimit) {
      return {
        valid: false,
        reason: `Daily limit of ₦${tierLimits.dailyLimit.toLocaleString()} exceeded`
      };
    }
    
    if (monthlyTotal + amount > tierLimits.monthlyLimit) {
      return {
        valid: false,
        reason: `Monthly limit of ₦${tierLimits.monthlyLimit.toLocaleString()} exceeded`
      };
    }
    
    return { valid: true };
  }

  private static async getAnnualTotal(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', today);

    if (error) throw error;
    return data.reduce((sum, tx) => sum + tx.amount, 0);
  }
}