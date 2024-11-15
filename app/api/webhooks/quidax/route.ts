import { NextResponse } from "next/server";
import { QuidaxService } from "@/app/lib/services/quidax";
import { TransactionStatusService } from "@/app/lib/services/transaction-status";
import supabase from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-quidax-signature');

    // Verify webhook signature
    if (!QuidaxService.verifyWebhookSignature(body, signature)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const { reference, status, payment_reference } = body;

    // Find transaction by Quidax reference
    const { data: transaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('quidax_reference', reference)
      .single();

    if (!transaction) {
      return new NextResponse('Transaction not found', { status: 404 });
    }

    // Update transaction status
    await TransactionStatusService.updateStatus(
      transaction.id,
      status,
      payment_reference
    );

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}