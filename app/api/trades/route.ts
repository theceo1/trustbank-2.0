import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const trade = await UnifiedTradeService.createTrade({
      userId: user.id,
      amount: body.amount,
      type: body.type,
      currency: body.currency,
      rate: body.rate,
      paymentMethod: body.paymentMethod
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Trade creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create trade' },
      { status: 500 }
    );
  }
}