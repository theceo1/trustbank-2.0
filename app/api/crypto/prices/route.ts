import { NextResponse } from 'next/server';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'simple/price';
    const params = searchParams.toString().replace('endpoint=' + endpoint + '&', '');

    const response = await fetch(`${COINGECKO_API_URL}/${endpoint}?${params}`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Crypto API error:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto data' }, { status: 500 });
  }
}