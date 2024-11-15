import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import supabase from '@/lib/supabase/client';
import crypto from 'crypto';
import { CryptoTransaction } from '@/app/types/transactions';

const verifyWebhookSignature = (payload: any, signature: string | null) => {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', process.env.QUIDAX_SECRET_KEY || '');
  const computedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headersList = await headers();
    const signature = headersList.get('x-quidax-signature');
    
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { transaction, event } = body;

    // Update transaction in your database
    const { error } = await supabase
      .from('transactions')
      .update({
        status: transaction.status.toLowerCase(),
        updated_at: new Date().toISOString(),
        payment_reference: transaction.payment_reference,
        crypto_amount: transaction.crypto_amount,
        rate: transaction.rate
      })
      .eq('external_id', transaction.id);

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}