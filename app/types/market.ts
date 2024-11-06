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
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
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