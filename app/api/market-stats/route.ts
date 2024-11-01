// app/api/market-stats/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/global',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const { data } = await response.json();
    
    return NextResponse.json({
      total_market_cap: data.total_market_cap.usd,
      total_volume: data.total_volume.usd,
      market_cap_change_percentage_24h: data.market_cap_change_percentage_24h_usd,
      btc_dominance: data.market_cap_percentage.btc,
      eth_dominance: data.market_cap_percentage.eth,
      active_cryptocurrencies: data.active_cryptocurrencies,
      markets: data.markets
    });
  } catch (error) {
    console.error('Error fetching market stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market stats' },
      { status: 500 }
    );
  }
}