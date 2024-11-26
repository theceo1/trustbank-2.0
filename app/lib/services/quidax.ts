//app/lib/services/quidax.ts
import { CreateTradeParams, QuidaxTradeResponse, QuidaxRateParams, TradeDetails, OrderStatus } from '@/app/types/trade';
import { createHmac } from 'crypto';
import { CONFIG } from './config';

export class QuidaxError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'QuidaxError';
  }
}

export class QuidaxService {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${CONFIG.QUIDAX_API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.QUIDAX_API_KEY}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Quidax API request failed');
    }
    return response;
  }

  static async getRate(params: QuidaxRateParams) {
    try {
      const response = await this.makeRequest('/v1/instant_orders/quote', {
        method: 'POST',
        body: JSON.stringify({
          amount: params.amount,
          currency_pair: params.currency_pair,
          type: params.type,
        })
      });

      const data = await response.json();
      return {
        rate: Number(data.rate),
        total: Number(data.total),
        fee: Number(data.fee),
        expiresAt: new Date(Date.now() + 30000).toISOString() // 30 seconds from now
      };
    } catch (error) {
      console.error('Rate fetch error:', error);
      throw error;
    }
  }

  static async createTrade(params: CreateTradeParams): Promise<QuidaxTradeResponse> {
    try {
      const response = await this.makeRequest('/v1/trades', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    } catch (error) {
      console.error('Trade creation error:', error);
      throw error;
    }
  }

  static async getTradeDetails(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}`);
      return response.json();
    } catch (error) {
      console.error('Trade details fetch error:', error);
      throw error;
    }
  }

  static async getTradeStatus(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}/status`);
      return response.json();
    } catch (error) {
      console.error('Trade status fetch error:', error);
      throw error;
    }
  }

  static async processWalletPayment(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: 'wallet' })
      });
      return response.json();
    } catch (error) {
      console.error('Wallet payment error:', error);
      throw error;
    }
  }

  static async getPaymentDetails(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}/payment`);
      return response.json();
    } catch (error) {
      console.error('Payment details fetch error:', error);
      throw error;
    }
  }

  static verifyWebhookSignature(payload: any, signature: string | null): boolean {
    if (!signature) return false;
    
    const webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET || '';
    const hmac = createHmac('sha256', webhookSecret);
    const computedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
    
    return signature === computedSignature;
  }

  static mapQuidaxStatus(status: string): 'pending' | 'completed' | 'failed' {
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

  static async processPayment(trade: TradeDetails) {
    try {
      const response = await this.makeRequest(`/v1/trades/${trade.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: trade.paymentMethod })
      });
      return response.json();
    } catch (error) {
      throw new Error('Failed to process payment');
    }
  }

  static async verifyPayment(reference: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${reference}/verify`);
      return response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  static async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest(`/v1/orders/${orderId}`);
      return response.json();
    } catch (error) {
      console.error('Order status fetch error:', error);
      throw error;
    }
  }

  static async initializeBankTransfer(params: {
    amount: number;
    currency: string;
    reference: string;
  }) {
    try {
      const response = await this.makeRequest('/v1/bank_transfers/initialize', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    } catch (error) {
      console.error('Bank transfer initialization error:', error);
      throw error;
    }
  }

  static async initializeCardPayment(params: {
    amount: number;
    currency: string;
    tradeId: string;
    reference: string;
  }) {
    try {
      const response = await this.makeRequest('/v1/card_payments/initialize', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    } catch (error) {
      console.error('Card payment initialization error:', error);
      throw error;
    }
  }

  private static baseUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async getMarketStats(pair: string) {
    try {
      const response = await fetch(`${this.baseUrl}/markets/${pair}/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        last_price: data.last_price,
        price_change_24h: data.price_change_24h
      };
    } catch (error) {
      console.error('QuidaxService getMarketStats error:', error);
      throw error;
    }
  }
}