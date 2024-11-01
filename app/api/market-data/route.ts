import { NextResponse } from 'next/server';
import { CryptoData } from '@/app/types/market';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function GET() {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true`,
      {
        headers: {
          'Accept': 'application/json',
          // Add your API key if you have one
          // 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY,
        },
        next: { revalidate: 30 } // Cache for 30 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: CryptoData[] = await response.json();
    
    // Format and clean the data
    const formattedData = data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      ath: coin.ath,
      ath_change_percentage: coin.ath_change_percentage,
      ath_date: coin.ath_date,
      image: coin.image
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}