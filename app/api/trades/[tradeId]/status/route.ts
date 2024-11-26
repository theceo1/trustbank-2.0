import { NextResponse } from 'next/server';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { getCurrentUser } from '@/app/lib/session';
import { TradeStatus } from '@/app/types/trade';

type Params = {
  params: {
    tradeId: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { status } = await UnifiedTradeService.getTradeStatus(params.tradeId);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Trade status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check trade status' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const body = await request.json();
    const { status, metadata } = body;

    if (!Object.values(TradeStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid trade status' }, { status: 400 });
    }

    await UnifiedTradeService.updateTradeStatus(
      params.tradeId,
      status as TradeStatus,
      metadata
    );

    return NextResponse.json({ 
      success: true,
      status,
      tradeId: params.tradeId 
    });
  } catch (error) {
    console.error('Trade status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update trade status' },
      { status: 500 }
    );
  }
}