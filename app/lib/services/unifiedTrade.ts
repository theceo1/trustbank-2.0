import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase/client';
import { QuidaxService } from './quidax';
import { KYCService } from './kyc';
import { TransactionLimitService } from './transactionLimits';
import { TradeDetails, UnifiedTradeParams } from '@/app/types/trade';

// Create namespace and export service
export namespace UnifiedTradeService {
  export type TradeDetails = {
    id: string;
    user_id: string;
    type: 'buy' | 'sell';
    currency: string;
    amount: number;
    rate: number;
    status: 'pending' | 'completed' | 'failed';
    payment_method: 'bank' | 'wallet';
    payment_url?: string;
    quidax_reference?: string;
    created_at: string;
    updated_at?: string;
  };

  export const createTrade = async (params: UnifiedTradeParams) => {
    console.debug('UnifiedTradeService.createTrade params:', params);
    // 1. Validate KYC
    const kycStatus = await KYCService.isEligibleForTrade(params.userId);
    if (!kycStatus.eligible) {
      throw new Error(kycStatus.reason);
    }

    // 2. Validate transaction limits
    const limitValidation = await TransactionLimitService.validateCryptoAmount(
      params.currency,
      params.amount
    );
    if (!limitValidation.valid) {
      throw new Error(limitValidation.reason);
    }

    // 1. Create local trade record first
    const tradeData = {
      user_id: params.userId,
      type: params.type,
      currency: params.currency.toLowerCase(),
      amount: Number(params.amount),
      rate: Number(params.rate),
      payment_method: params.paymentMethod,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert(tradeData)
      .select('*')
      .single();

    if (tradeError) throw new Error(`Failed to create trade record: ${tradeError.message}`);
    if (!trade) throw new Error('No trade data returned after creation');

    try {
      // 2. Create Quidax order through backend API
      const quidaxOrder = await QuidaxService.createTrade({
        amount: params.amount,
        currency: params.currency,
        type: params.type,
        payment_method: params.paymentMethod,
        trade_id: trade.id
      });

      if (!quidaxOrder.data || !quidaxOrder.data.instant_order) {
        throw new Error('Invalid response from Quidax');
      }

      const { error: updateError } = await supabase
        .from('trades')
        .update({
          quidax_reference: quidaxOrder.data.instant_order.id,
          payment_url: quidaxOrder.data.payment_url,
          status: quidaxOrder.data.instant_order.status
        })
        .eq('id', trade.id);

      if (updateError) throw new Error(`Failed to update trade: ${updateError.message}`);

      return {
        ...trade,
        quidax_reference: quidaxOrder.data.instant_order.id,
        payment_url: quidaxOrder.data.payment_url
      };
    } catch (error) {
      // Rollback trade record if Quidax order fails
      await supabase
        .from('trades')
        .update({ status: 'failed' })
        .eq('id', trade.id);
      
      throw error;
    }
  };

  export const getTrade = async (id: string): Promise<TradeDetails> => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  };

  export const updateTradeStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('trades')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  };

  export const getUserTrades = async (userId: string): Promise<TradeDetails[]> => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };
}

export type { TradeDetails };