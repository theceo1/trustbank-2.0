import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const timeframe = searchParams.get('timeframe');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  let interval: string;
  let limit: number;
  let startTime: number | undefined;

  // Configure timeframes
  switch (timeframe) {
    case '1H':
      interval = '1m';
      limit = 60;
      startTime = Date.now() - 3600000; // 1 hour ago
      break;
    case '24H':
      interval = '15m';
      limit = 96;
      startTime = Date.now() - 86400000; // 24 hours ago
      break;
    case '7D':
      interval = '2h';
      limit = 84;
      startTime = Date.now() - 604800000; // 7 days ago
      break;
    case '30D':
      interval = '8h';
      limit = 90;
      startTime = Date.now() - 2592000000; // 30 days ago
      break;
    case 'ALL':
      interval = '1d';
      limit = 365;
      startTime = Date.now() - 31536000000; // 1 year ago
      break;
    default:
      interval = '15m';
      limit = 96;
      startTime = Date.now() - 86400000; // 24 hours ago
  }

  try {
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}${startTime ? `&startTime=${startTime}` : ''}`;
    
    const response = await fetch(binanceUrl);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to the format we need
    const formattedData = data.map((candle: any) => ({
      timestamp: candle[0], // Open time
      price: parseFloat(candle[4]) // Close price
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}