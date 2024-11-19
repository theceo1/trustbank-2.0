export interface ChartData {
  timestamp: number;
  price: number;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
}

export interface WebSocketPrice {
  [key: string]: number;
}

export interface PriceData {
  price: number;
  timestamp: number;
}

export type TimeFrame = '1H' | '24H' | '7D' | '30D' | 'ALL';

export interface CryptoHistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface MarketStats {
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  market_cap_change_percentage_24h: number;
}

export interface CryptoPriceData {
  symbol: string;
  price: number;
  change24h: number;
}

export interface DetailedCryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  supply: {
    circulating: number;
    total: number;
    max?: number;
  };
}

export interface MarketOverview {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  marketCapChange24h: number;
}

export interface MarketData {
  ticker: {
    buy: string;
    sell: string;
    low: string;
    high: string;
    last: string;
    vol: string;
    change: string;
  }
}

export interface WalletBalance {
  currency: string;
  available: number;
  pending: number;
  id?: string; 
}