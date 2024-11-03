import { NextResponse } from 'next/server';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
    }

    const response = await fetch(`${COINGECKO_BASE_URL}${endpoint}`, {
      headers: {
        'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from CoinGecko' },
      { status: 500 }
    );
  }
}