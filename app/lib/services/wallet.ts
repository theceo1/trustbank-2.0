import supabase from "@/lib/supabase/client";
import { QuidaxService } from './quidax';

interface WalletBalance {
  currency: string;
  available: number;
  pending: number;
}

export class WalletService {
  static async getWalletBalance(userId: string): Promise<WalletBalance[]> {
    try {
      // Get local wallet balance
      const { data: localWallet, error: localError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (localError) throw localError;

      // Get exchange wallet balance
      const exchangeWallet = await QuidaxService.getWalletBalance(userId);

      // Combine and normalize balances
      return this.normalizeBalances(localWallet, exchangeWallet);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  static async transferToExchange(userId: string, amount: number): Promise<void> {
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError) throw walletError;
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Start transaction
    const { error: txError } = await supabase.rpc('transfer_to_exchange', {
      p_user_id: userId,
      p_amount: amount
    });

    if (txError) throw txError;
  }

  private static normalizeBalances(local: any, exchange: any): WalletBalance[] {
    const balances: WalletBalance[] = [];
    const currencies = new Set([
      ...Object.keys(local?.balances || {}),
      ...Object.keys(exchange?.balances || {})
    ]);

    currencies.forEach(currency => {
      balances.push({
        currency,
        available: (local?.balances?.[currency]?.available || 0) + 
                  (exchange?.balances?.[currency]?.available || 0),
        pending: (local?.balances?.[currency]?.pending || 0) + 
                (exchange?.balances?.[currency]?.pending || 0)
      });
    });

    return balances;
  }
}