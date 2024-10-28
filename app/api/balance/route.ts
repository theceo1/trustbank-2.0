import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import supabaseClient from '@/lib/supabase/client';

export interface BalanceResponse {
  total: number;
  available: number;
  pending: number;
  currency: string;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Default balance data
    const defaultBalance: BalanceResponse = {
      total: 0,
      available: 0,
      pending: 0,
      currency: 'NGN'
    };

    const { data: balance, error } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      return NextResponse.json(defaultBalance);
    }

    return NextResponse.json({
      total: balance?.total || 0,
      available: balance?.available || 0,
      pending: balance?.pending || 0,
      currency: balance?.currency || 'NGN'
    });
  } catch (error) {
    console.error('Balance API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
