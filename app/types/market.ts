export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  image: string;
}

export interface ChartData {
  timestamp: number;
  [key: string]: number; // For different crypto prices
  price: number;
  volume: number;
}

export interface WebSocketPrice {
  [key: string]: {
    price: number;
    change_24h: number;
    volume_24h: number;
    market_cap: number;
  }
}

export interface MarketStats {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  market_cap_change_24h: number;
}

export type TimeFrame = '1H' | '24H' | '7D' | '30D' | 'ALL';

export interface CryptoHistoricalData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][]; // [timestamp, market_cap]
  total_volumes: [number, number][]; // [timestamp, volume]
}

export interface CryptoPair {
  base: string;
  quote: string;
  last_price: number;
  volume_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
}

export interface MarketOverviewProps {
  itemsPerPage?: number;
  showChart?: boolean;
  onCryptoSelect?: (crypto: string) => void;
  selectedTimeFrame?: TimeFrame;
}

export interface ChartProps {
  data: ChartData[];
  timeFrame: TimeFrame;
  currency: string;
  isLoading?: boolean;
  height?: number;
  showVolume?: boolean;
}
export interface CoinData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    image: string;
  }