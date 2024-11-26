//app/api/webhooks/quidax/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';
import { WalletService } from '@/app/lib/services/wallet';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-quidax-signature');

    if (!QuidaxService.verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.rpc('handle_quidax_webhook', {
      reference: payload.reference,
      status: QuidaxService.mapQuidaxStatus(payload.status),
      webhook_data: payload
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}