import supabase from '@/lib/supabase/client';
import { ConfigService } from './config';
import { QuidaxInitiateResponse, QuidaxTransaction } from '../types/quidax';
import { TransactionStatus } from '@/app/types/transactions';
import { PaymentMethodType } from '@/app/types/payment';
import { createHmac } from 'crypto';
import { MarketData, WalletBalance } from '@/app/types/market';
import {  TradeDetails, QuidaxRateParams, TradeRateRequest, CreateOrderRequest } from '@/app/types/trade';

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
  private static getConfig() {
    const config = ConfigService.getQuidaxConfig();
    if (!config.apiKey) {
      throw new Error('Missing Quidax API key');
    }
    return config;
  }

  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const config = this.getConfig();
    const url = `${config.apiUrl}${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Quidax API error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || 'Failed to make Quidax API request');
      }

      return data;
    } catch (error: any) {
      console.error('Quidax request failed:', error);
      throw error;
    }
  }

  static async createOrder(params: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const requestBody = {
        market: `${params.currency.toLowerCase()}ngn`,
        side: params.type,
        ord_type: 'market',
        volume: params.amount.toString(),
        metadata: {
          trade_id: params.trade_id,
          payment_method: params.payment_method
        }
      };

      const response = await this.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      return response.data;
    } catch (error: any) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  static async getPaymentDetails(orderId: string) {
    const config = this.getConfig();
    try {
      const response = await this.makeRequest(`/instant_orders/${orderId}/payment`);
      return await response.json();
    } catch (error) {
      console.error('Quidax payment details error:', error);
      throw error;
    }
  }

  static async verifyPayment(reference: string) {
    try {
      const response = await this.makeRequest(`/payments/verify/${reference}`);
      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

    static async getRate(params: TradeRateRequest) {
    const rateParams: RateParams = {
      amount: params.amount,
      currency_pair: `${params.currency.toLowerCase()}_ngn`,
      type: params.type
    };

    return this.makeRequest('/instant_orders/quote', {
      method: 'POST',
      body: JSON.stringify(rateParams)
    });
  }

  static async getOrderStatus(orderId: string): Promise<OrderStatus> {
    return this.makeRequest(`/instant_order/${orderId}`, {
      method: 'GET'
    });
  }

  static async getTransactionStatus(reference: string): Promise<OrderStatus> {
    return this.makeRequest(`/transactions/${reference}/status`, {
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
    const response = await this.makeRequest('/transactions', {
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
    currency: string;
    type: 'buy' | 'sell';
    payment_method: string;
    trade_id: string;
  }) {
    const config = this.getConfig();
    
    const requestBody = {
      bid: 'ngn',
      ask: params.currency.toLowerCase(),
      type: params.type,
      total: params.amount.toString(),
      unit: 'ngn',
      metadata: {
        trade_id: params.trade_id,
        payment_method: params.payment_method
      }
    };

    console.debug('Creating Quidax trade:', {
      url: `${config.apiUrl}/users/me/instant_orders`,
      body: requestBody
    });

    return this.makeRequest('/users/me/instant_orders', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
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

  static async processWalletPayment(tradeId: string) {
    return this.makeRequest(`/instant_orders/${tradeId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: 'wallet' })
    });
  }

  static mapQuidaxStatus(status: string): TransactionStatus {
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
    const response = await this.makeRequest(`/markets/${pair}/ticker`, {
      method: 'GET'
    });
    return response;
  }

  static async getWalletBalance(userId: string) {
    return this.makeRequest(`/users/${userId}/wallets`, {
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

interface RateParams extends QuidaxRateParams {
  paymentMethodId?: string;
}