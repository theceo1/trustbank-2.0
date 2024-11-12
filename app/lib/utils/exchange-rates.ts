const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const EXCHANGE_RATE_CACHE_TIME = 3600; // 1 hour in seconds
const DEFAULT_NGN_RATE = 1250; // Default fallback rate

let cachedRate: number = DEFAULT_NGN_RATE;
let lastFetchTime: number = 0;

export async function getNGNRate(): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  
  // Return cached rate if it's less than 1 hour old
  if ((now - lastFetchTime) < EXCHANGE_RATE_CACHE_TIME) {
    return cachedRate;
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/USD/NGN`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    cachedRate = data.conversion_rate;
    lastFetchTime = now;
    
    return cachedRate;
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    // Return current cached rate (which might be the default)
    return cachedRate;
  }
}