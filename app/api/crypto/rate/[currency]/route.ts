import { type NextRequest } from 'next/server';

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/price';
const NGN_RATE = 1250;

export async function GET(
  _request: NextRequest,
  { params }: { params: { currency: string } }
): Promise<Response> {
  try {
    const currency = params.currency.toUpperCase();
    let usdPrice = 1;
    let rate = NGN_RATE;

    if (currency === 'BTC' || currency === 'ETH') {
      const response = await fetch(
        `${BINANCE_API}?symbol=${currency}USDT`
      );
      if (!response.ok) throw new Error('Failed to fetch rate');
      const data = await response.json();
      usdPrice = parseFloat(data.price);
      rate = usdPrice * NGN_RATE;
    }

    return Response.json({ rate, usdPrice });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch rate' },
      { status: 500 }
    );
  }
}