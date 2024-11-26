//app/api/trades/create/route.ts
import { NextResponse } from 'next/server';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { getCurrentUser } from '@/app/lib/session';
import { TradeParams, TradeType } from '@/app/types/trade';
import { TradeErrorHandler } from '@/app/lib/services/tradeErrorHandler';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const reference = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const tradeParams: TradeParams = {
      user_id: user.email,
      type: body.type as TradeType,
      currency: body.currency,
      amount: body.amount,
      rate: body.rate,
      total: body.amount * body.rate,
      fees: {
        service: body.amount * 0.01,
        network: 0.001
      },
      reference,
      paymentMethod: body.paymentMethod
    };

    const trade = await UnifiedTradeService.createTrade(tradeParams);
    return NextResponse.json(trade);
  } catch (error: any) {
    TradeErrorHandler.handleError(error, 'Trade creation');
    return NextResponse.json(
      { error: error.message || 'Failed to create trade' },
      { status: 500 }
    );
  }
}