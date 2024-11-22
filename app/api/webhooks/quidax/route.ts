import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import supabase from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-quidax-signature');

    if (!QuidaxService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = body;

    if (event === 'order.done') {
      const tradeId = data.metadata?.trade_id;
      if (!tradeId) {
        console.error('No trade_id in webhook metadata');
        return NextResponse.json({ error: 'No trade ID found' }, { status: 400 });
      }

      const status = data.status === 'done' ? 'completed' : 'failed';
      
      const { error } = await supabase
        .from('trades')
        .update({
          status,
          quidax_reference: data.id,
          executed_amount: data.executed_volume.amount,
          executed_price: data.avg_price.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      if (error) {
        console.error('Error updating trade:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}