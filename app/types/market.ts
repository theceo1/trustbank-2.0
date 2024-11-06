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
  price_change_percentage_24h: number;
  total_volume: number;
}

export interface WebSocketPrice {
  [key: string]: number;
}

export interface PriceData {
  price: number;
  timestamp: number;
}