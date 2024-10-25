import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = await createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance, currency')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { 
        balance: 0,
        currency: 'NGN'
      }, 
      { status: 200 }
    );
  }
}
