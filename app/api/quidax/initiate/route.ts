import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const QUIDAX_API_KEY = process.env.QUIDAX_API_KEY;
const QUIDAX_API_URL = process.env.QUIDAX_API_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, type, userId } = body;

    const response = await fetch(`${QUIDAX_API_URL}/instant_order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QUIDAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency_pair: `${currency}_ngn`,
        side: type,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/quidax/webhook`,
        metadata: {
          user_id: userId
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initiate transaction');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Quidax API error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate transaction' },
      { status: 500 }
    );
  }
}