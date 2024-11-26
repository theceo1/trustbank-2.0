import { PaymentMethodType } from "./payment";

export enum TradeType {
  BUY = 'buy',
  SELL = 'sell'
}

export enum TradeStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface TradeParams {
  user_id: string;
  type: TradeType;
  currency: string;
  amount: number;
  rate: number;
  total: number;
  fees: {
    service: number;
    network: number;
  };
  reference: string;
  paymentMethod: PaymentMethodType;
}

export interface TradeDetails extends TradeParams {
  id: string;
  status: TradeStatus;
  quidax_reference: string;
  created_at: string;
  updated_at: string;
  walletBalance?: number;
}

export interface TradeRateRequest {
  amount: number;
  currency_pair: string;
  type: 'buy' | 'sell';
}

export interface TradeRateResponse {
  rate: number;
  total: number;
  timestamp: number;
}

export interface QuidaxTradeResponse {
  id: string;
  status: string;
  reference: string;
  quidax_reference: string;
}

export interface CreateTradeParams extends Omit<TradeParams, 'reference'> {
  rateTimestamp?: number;
}

export interface QuidaxRateParams {
  amount: number;
  currency_pair: string;
  type: 'buy' | 'sell';
}

export interface OrderStatus {
  id: string;
  status: string;
  type: string;
  amount: string;
  filled_amount: string;
  price: string;
  created_at: string;
  updated_at: string;
}

export interface AutomatedTradeRule {
  id: string;
  user_id: string;
  currency: string;
  amount: number;
  target_rate: number;
  trade_type: 'buy' | 'sell';
  expires_at?: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}