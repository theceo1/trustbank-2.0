import { NextRequest, NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const { status, payment_reference } = await QuidaxService.checkPaymentStatus(params.reference);
    
    return NextResponse.json({ 
      status,
      payment_reference,
      verified: status === 'completed'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}