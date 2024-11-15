export const currencyIds = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin'
} as const;

export const SUPPORTED_CRYPTOCURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC'] as const;
export type SupportedCryptoCurrency = typeof SUPPORTED_CRYPTOCURRENCIES[number];