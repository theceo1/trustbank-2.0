export type PaymentMethodType = 'bank' | 'wallet';

export interface TradeDetails {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: PaymentMethodType;
  payment_url?: string;
  quidax_reference?: string;
  created_at: string;
  updated_at?: string;
}

export interface TradeParams {
  userId: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  paymentMethod: PaymentMethodType;
}

export interface UnifiedTradeParams {
  userId: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  paymentMethod: PaymentMethodType;
}

export interface QuidaxTradeResponse {
  id: string;
  reference: string;
  payment_url?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface QuidaxRateParams {
  amount: number;
  currency_pair: string;
  type: 'buy' | 'sell';
}

export interface TradeRateRequest {
  amount: number;
  currency: string;
  type: 'buy' | 'sell';
  pair?: string;
}

export interface CreateTradeParams {
  amount: number;
  currency: string;
  type: 'buy' | 'sell';
  payment_method: string;
  trade_id: string;
  callback_url?: string;
}

export interface TradeResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  payment_url?: string;
  amount: number;
  currency: string;
}

export interface CreateOrderParams {
  amount: number;
  currency: string;
  type: 'buy' | 'sell';
  payment_method: string;
  trade_id: string;
  callback_url: string;
}

export interface OrderResponse {
  id: string;
  status: string;
  payment_url?: string;
  amount: number;
  currency: string;
}

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  type: 'buy' | 'sell';
  payment_method: string;
  trade_id: string;
  callback_url: string;
}

export interface OrderResponse {
  id: string;
  status: string;
  payment_url?: string;
  amount: number;
  currency: string;
}