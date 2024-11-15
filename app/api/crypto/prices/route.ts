import { NextResponse } from 'next/server';

const SUPPORTED_CRYPTOCURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC'];

export async function GET() {
  try {
    const prices: Record<string, { price: number, change24h: number }> = {};
    
    // Fetch from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) throw new Error('Failed to fetch prices');
    
    const data = await response.json();
    
    // Map CoinGecko response to our format
    const mappings = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'usd-coin': 'USDC'
    };

    for (const [geckoId, symbol] of Object.entries(mappings)) {
      prices[symbol] = {
        price: data[geckoId].usd,
        change24h: data[geckoId].usd_24h_change
      };
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}