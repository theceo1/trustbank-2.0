// app/api/market-stats/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/global'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch market stats');
    }

    const data = await response.json();
    const { data: marketData } = data;

    return NextResponse.json({
      total_market_cap: marketData.total_market_cap.usd,
      total_volume: marketData.total_volume.usd,
      btc_dominance: marketData.market_cap_percentage.btc,
      market_cap_change_percentage_24h: marketData.market_cap_change_percentage_24h_usd
    });
  } catch (error) {
    console.error('Error fetching market stats:', error);
    return NextResponse.json(
      { 
        total_market_cap: 0,
        total_volume: 0,
        btc_dominance: 0,
        market_cap_change_percentage_24h: 0
      },
      { status: 200 }
    );
  }
}