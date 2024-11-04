import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true');
    const data = await response.json();
    
    return NextResponse.json([
      {
        symbol: 'BTC',
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change
      },
      {
        symbol: 'ETH',
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change
      },
      {
        symbol: 'USDT',
        price: data.tether.usd,
        change24h: data.tether.usd_24h_change
      }
    ]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}