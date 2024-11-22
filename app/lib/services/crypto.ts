import { QuidaxService } from './quidax';
import { DetailedCryptoPrice, MarketOverview } from '@/app/types/market';
import { handleError } from '@/app/lib/utils/errorHandler';
import { OrderResponse, CreateOrderRequest } from '@/app/types/trade';

interface TradeParams {
  amount: number;
  cryptoCurrency: string;
  type: 'buy' | 'sell';
}

interface RateResponse {
  rate: number;
  fee: number;
  total: number;
}

export class CryptoTradeService {
  static async getRate({ amount, cryptoCurrency, type }: TradeParams): Promise<RateResponse> {
    try {
      const response = await QuidaxService.getRate({
        amount,
        currency: cryptoCurrency,
        type,
        pair: `${cryptoCurrency}_ngn`
      });

      return {
        rate: response.rate,
        fee: response.fee || 0,
        total: type === 'buy' ? amount + (response.fee || 0) : amount - (response.fee || 0)
      };
    } catch (error) {
      console.error('Error fetching rate:', error);
      throw new Error('Unable to fetch current rate');
    }
  }

  static async createOrder({ amount, cryptoCurrency, type }: TradeParams): Promise<OrderResponse> {
    try {
      const tradeId = crypto.randomUUID();
      const orderParams: CreateOrderRequest = {
        amount,
        currency: cryptoCurrency,
        type,
        payment_method: 'bank',
        trade_id: tradeId,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/trade`
      };

      const response = await QuidaxService.createOrder(orderParams);
      
      return {
        id: response.id,
        status: response.status,
        payment_url: response.payment_url,
        amount: amount,
        currency: cryptoCurrency
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Unable to create order');
    }
  }
}

export class CryptoService {
  private static COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private static SUPPORTED_CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC'];
  private static COIN_IDS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'USDC': 'usd-coin'
  };

  static async getDetailedPrices(): Promise<DetailedCryptoPrice[]> {
    try {
      const coinIds = Object.values(this.COIN_IDS).join(',');
      const response = await fetch(
        `${this.COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false&price_change_percentage=24h&locale=en`
      );

      if (!response.ok) throw new Error('Failed to fetch detailed prices');
      const data = await response.json();

      return data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        volume24h: coin.total_volume,
        marketCap: coin.market_cap,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        supply: {
          circulating: coin.circulating_supply,
          total: coin.total_supply,
          max: coin.max_supply
        }
      }));
    } catch (error) {
      handleError(error, 'Failed to fetch detailed prices');
      throw error;
    }
  }

  static async getMarketOverview(): Promise<MarketOverview> {
    try {
      const response = await fetch(`${this.COINGECKO_API}/global`);
      if (!response.ok) throw new Error('Failed to fetch market overview');
      
      const { data } = await response.json();
      
      return {
        totalMarketCap: data.total_market_cap.usd,
        totalVolume24h: data.total_volume.usd,
        btcDominance: data.market_cap_percentage.btc,
        marketCapChange24h: data.market_cap_change_percentage_24h_usd
      };
    } catch (error) {
      handleError(error, 'Failed to fetch market overview');
      throw error;
    }
  }
}