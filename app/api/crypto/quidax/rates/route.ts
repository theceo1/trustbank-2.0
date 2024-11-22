import { QuidaxService } from '@/app/lib/services/quidax';
import { NextResponse } from 'next/server';
import { FeeService } from '@/app/lib/services/fees';
import { PaymentMethodType } from '@/app/types/payment';
import { TradeRateRequest } from '@/app/types/trade';

export async function POST(request: Request) {
  try {
    const { currency, type, amount } = await request.json();
    
    const rateRequest: TradeRateRequest = {
      amount: amount || 1,
      currency,
      type: type || 'buy'
    };
    
    const quote = await QuidaxService.getRate(rateRequest);

    // Calculate rates including our spread
    const spread = 0.005; // 0.5%
    const rate = quote.rate;
    const buyRate = rate * (1 + spread);
    const sellRate = rate * (1 - spread);

    // Calculate fees
    const paymentMethods: PaymentMethodType[] = ['bank', 'card', 'wallet'];
    const feesByMethod = paymentMethods.map(method => ({
      method,
      fees: FeeService.calculateTradeFees(amount || 1, method)
    }));

    return NextResponse.json({ 
      buyRate, 
      sellRate,
      feesByMethod: feesByMethod.map(({ method, fees }) => ({
        method,
        ...FeeService.formatFeeBreakdown(fees)
      })),
      lastUpdated: new Date().toISOString(),
      spread: spread * 100
    });
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rates' }, 
      { status: 500 }
    );
  }
}