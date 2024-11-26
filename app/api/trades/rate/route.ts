import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';
import { TradeRateRequest } from '@/app/types/trade';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TradeRateRequest = await request.json();
    const rate = await QuidaxService.getRate({
      amount: body.amount,
      currency_pair: `${body.currency}_ngn`,
      type: body.type
    });

    return NextResponse.json(rate);
  } catch (error: any) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rate' },
      { status: 500 }
    );
  }
}