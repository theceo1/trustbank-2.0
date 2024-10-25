import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = await createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    // Mock transaction data for now
    const transactions = [
      {
        id: 1,
        type: 'deposit',
        amount: 5000,
        status: 'completed',
        date: new Date().toISOString(),
      },
      // Add more mock transactions as needed
    ];

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
