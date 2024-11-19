import supabase from '@/lib/supabase/client';
import { ConfigService } from './config';
import { QuidaxInitiateResponse, QuidaxTransaction } from '../types/quidax';
import { TransactionStatus } from '@/app/types/transactions';
import { PaymentMethodType } from '@/app/types/payment';
import { createHmac } from 'crypto';
import { MarketData, WalletBalance } from '@/app/types/market';

export class QuidaxError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'QuidaxError';
  }
}

export class QuidaxService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const apiUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
    const apiKey = process.env.QUIDAX_SECRET_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing Quidax configuration');
    }
    
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new QuidaxError(
          data.message || 'Quidax API error',
          data.code,
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof QuidaxError) {
        throw error;
      }
      throw new QuidaxError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  static async getRate({ amount, pair, type }: RateParams): Promise<RateResponse> {
    return this.makeRequest<RateResponse>('/instant_order/quote', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        pair,
        type
      })
    });
  }

  static async createOrder({ amount, pair, type }: OrderParams): Promise<OrderResponse> {
    return this.makeRequest<OrderResponse>('/instant_order', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        pair,
        type
      })
    });
  }

  static async getOrderStatus(orderId: string): Promise<OrderStatus> {
    return this.makeRequest<OrderStatus>(`/instant_order/${orderId}`, {
      method: 'GET'
    });
  }

  static async getTransactionStatus(reference: string): Promise<OrderStatus> {
    return this.makeRequest<OrderStatus>(`/transactions/${reference}/status`, {
      method: 'GET'
    });
  }

  static async updateTransactionStatus(transactionId: string, status: OrderStatus) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: status.status,
        payment_reference: status.payment_reference,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) throw error;
    return data;
  }

  static async createTransaction(params: {
    amount: number;
    currency: string;
    type: 'buy' | 'sell';
    callback_url: string;
    payment_method?: PaymentMethodType;
  }): Promise<QuidaxTransaction> {
    const response = await this.makeRequest<QuidaxInitiateResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        currency_pair: `${params.currency.toLowerCase()}_ngn`
      })
    });

    if (!response.data || !response.data.transaction) {
      throw new QuidaxError('Failed to create transaction: No transaction data received');
    }

    return response.data.transaction;
  }

  static async createTrade(params: {
    amount: number;
    cryptoCurrency: string;
    type: 'buy' | 'sell';
    userId: string;
    paymentMethod: PaymentMethodType;
  }) {
    const callback_url = `${window.location.origin}/api/webhooks/quidax`;
    
    try {
      const transaction = await this.createTransaction({
        amount: params.amount,
        currency: params.cryptoCurrency,
        type: params.type,
        callback_url,
        payment_method: params.paymentMethod
      });

      // Create local transaction record
      const { data: localTransaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: params.userId,
          type: params.type,
          amount: params.amount,
          crypto_currency: params.cryptoCurrency,
          status: 'pending',
          quidax_reference: transaction.id,
          payment_url: transaction.payment_url,
          payment_method: params.paymentMethod
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...localTransaction,
        payment_url: transaction.payment_url
      };
    } catch (error) {
      throw new QuidaxError(
        error instanceof Error ? error.message : 'Failed to create trade'
      );
    }
  }

  static async checkPaymentStatus(reference: string): Promise<{
    status: TransactionStatus;
    payment_reference?: string;
  }> {
    const status = await this.getTransactionStatus(reference);
    return {
      status: this.mapQuidaxStatus(status.status),
      payment_reference: status.payment_reference
    };
  }

  static async processWalletPayment(transactionId: string) {
    const { data, error } = await supabase.rpc('process_wallet_payment', {
      transaction_id: transactionId
    });

    if (error) throw error;
    return data;
  }

  private static mapQuidaxStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'completed';
      case 'failed':
      case 'cancelled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  static verifyWebhookSignature(payload: any, signature: string | null): boolean {
    if (!signature) return false;
    const config = ConfigService.getQuidaxConfig();
    
    const hmac = createHmac('sha256', config.apiKey);
    const computedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
    
    return signature === computedSignature;
  }

  static async getMarketData(pair: string): Promise<MarketData> {
    const response = await this.makeRequest<MarketData>(`/markets/${pair}/ticker`, {
      method: 'GET'
    });
    return response;
  }

  static async getWalletBalance(userId: string) {
    return this.makeRequest<WalletBalance>(`/users/${userId}/wallets`, {
      method: 'GET'
    });
  }
}

interface RateResponse {
  rate: number;
  fee: number;
  total: number;
}

interface OrderResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  payment_url?: string;
}

interface OrderStatus {
  status: 'pending' | 'completed' | 'failed';
  payment_reference?: string;
}

interface RateParams {
  amount: number;
  pair: string;
  type: 'buy' | 'sell';
}

interface OrderParams extends RateParams {
  paymentMethodId?: string;
}