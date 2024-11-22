import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import { KYCService } from '@/app/lib/services/kyc';
import { TransactionLimitService } from '@/app/lib/services/transactionLimits';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, currency, amount, rate, paymentMethod } = body;

    // 1. Validate transaction limits
    const limitCheck = await TransactionLimitService.validateTransaction(userId, amount);
    if (!limitCheck.valid) {
      return NextResponse.json(
        { message: limitCheck.reason },
        { status: 400 }
      );
    }

    // 2. Create Quidax trade
    const trade = await QuidaxService.createTrade({
      amount,
      currency,
      type,
      payment_method: paymentMethod,
      trade_id: crypto.randomUUID()
    });

    return NextResponse.json(trade);
  } catch (error: any) {
    console.error('Trade creation error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create trade' },
      { status: 500 }
    );
  }
}