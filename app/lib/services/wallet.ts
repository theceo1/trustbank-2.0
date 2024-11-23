import supabase from '@/app/lib/supabase/client';
import { WalletBalance } from '@/app/types/market';

export class WalletService {
    static async transferToExchange(userId: string, amount: number) {
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError) throw walletError;
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const { error: transferError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (transferError) throw transferError;
  }

  static async getBalance(userId: string): Promise<number> {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return wallet?.balance || 0;
  }

  static async getWalletBalance(userId: string): Promise<WalletBalance[]> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, balance, pending_balance')
        .eq('user_id', userId);

      if (error) throw error;

      // Transform wallet data to match WalletBalance interface
      return data.map(wallet => ({
        id: wallet.id,
        total: wallet.balance,
        available: wallet.balance - (wallet.pending_balance || 0),
        pending: wallet.pending_balance || 0,
        currency: '₦'
      })) || [];
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }
}