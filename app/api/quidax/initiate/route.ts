import { NextResponse } from 'next/server';
import { ConfigService } from '@/app/lib/services/config';

export async function POST(request: Request) {
  try {
    const config = ConfigService.getQuidaxConfig();
    const body = await request.json();
    const { amount, currency, type, userId } = body;

    const response = await fetch(`${config.apiUrl}/instant_order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency_pair: `${currency}_ngn`,
        side: type,
        callback_url: `${config.appUrl}/api/quidax/webhook`,
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