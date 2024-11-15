import supabase from '@/lib/supabase/client';

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  transaction_reference?: string;
  payment_reference?: string;
}

export type PaymentMethod = {
  id: string;
  name: string;
  type: 'bank_transfer' | 'card' | 'ussd' | 'crypto';
  icon: string;
  fees: {
    percentage: number;
    fixed: number;
  };
  limits: {
    min: number;
    max: number;
  };
  enabled: boolean;
};

export class PaymentService {
  static async verifyPayment(reference: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`/api/payments/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Payment verification failed');
    }
  }

  static async updateTransactionStatus(transactionId: string, status: PaymentStatus) {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: status.status,
          payment_reference: status.payment_reference,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw new Error('Failed to update transaction status');
    }
  }

  static async getAvailablePaymentMethods(amount: number): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('enabled', true)
        .lte('limits->min', amount)
        .gte('limits->max', amount);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  static calculateFees(amount: number, method: PaymentMethod): number {
    const percentageFee = (amount * method.fees.percentage) / 100;
    return percentageFee + method.fees.fixed;
  }
}