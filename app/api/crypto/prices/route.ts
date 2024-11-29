import { NextResponse } from 'next/server';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') || 'BTC';

  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=bitcoin,ethereum,tether,usd-coin&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }

    const data = await response.json();
    
    const priceMap = {
      'BTC': data.bitcoin?.usd,
      'ETH': data.ethereum?.usd,
      'USDT': data.tether?.usd,
      'USDC': data['usd-coin']?.usd
    };

    return NextResponse.json(priceMap[currency as keyof typeof priceMap] || null);
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto price' }, { status: 500 });
  }
}