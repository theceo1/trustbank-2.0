import supabase from '@/lib/supabase/client';
import { QuidaxService } from './quidax';
import { MarketData as ImportedMarketData } from '@/app/types/market';

interface LocalMarketData {
  pair: string;
  last_price: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
}

interface MarketOverview {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  marketCapChange24h: number;
}

export class MarketService {
  private static cache: Map<string, { data: LocalMarketData; timestamp: number }> = new Map();
  private static CACHE_DURATION = 60 * 1000; // 1 minute

  private static transformMarketData(data: ImportedMarketData): LocalMarketData {
    const ticker = data.ticker;
    return {
      pair: data.market?.id || '',
      last_price: Number(ticker.last || 0),
      high_24h: Number(ticker.high || 0),
      low_24h: Number(ticker.low || 0),
      volume_24h: Number(ticker.vol || 0),
      price_change_24h: Number(ticker.change || 0),
      price_change_percentage_24h: Number(ticker.change || 0) * 100
    };
  }

  static async getMarketData(pair: string): Promise<LocalMarketData> {
    const cached = this.cache.get(pair);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const rawData = await QuidaxService.getMarketData(pair);
      const data = this.transformMarketData(rawData);
      
      this.cache.set(pair, { data, timestamp: Date.now() });
      
      // Store in database for historical tracking
      await this.storeMarketData(data);
      
      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  private static async storeMarketData(data: LocalMarketData) {
    const { error } = await supabase
      .from('market_history')
      .insert({
        pair: data.pair,
        price: data.last_price,
        high_24h: data.high_24h,
        low_24h: data.low_24h,
        volume_24h: data.volume_24h,
        timestamp: new Date().toISOString()
      });

    if (error) console.error('Error storing market data:', error);
  }

  static async getHistoricalPrices(pair: string, days: number = 7) {
    const { data, error } = await supabase
      .from('market_history')
      .select('price, timestamp')
      .eq('pair', pair)
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getMarketOverview(): Promise<MarketOverview> {
    const response = await fetch('https://api.example.com/market-overview');
    if (!response.ok) {
      throw new Error('Failed to fetch market overview');
    }
    return response.json();
  }
}