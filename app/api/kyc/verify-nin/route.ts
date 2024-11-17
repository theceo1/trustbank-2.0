import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const DOJAH_API_KEY = process.env.DOJAH_API_KEY;
const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
const DOJAH_BASE_URL = process.env.DOJAH_BASE_URL;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nin = formData.get('nin');
    const selfieImage = formData.get('selfie');
    
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call Dojah NIN verification API
    const ninResponse = await fetch(`${DOJAH_BASE_URL}/api/v1/kyc/nin/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DOJAH_API_KEY}`,
        'AppId': DOJAH_APP_ID!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nin })
    });

    const ninData = await ninResponse.json();

    if (!ninResponse.ok || !ninData.entity) {
      return NextResponse.json({ error: 'NIN verification failed' }, { status: 400 });
    }

    // Store verification data in Supabase
    const { error } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: user.id,
        verification_type: 'nin',
        level: 1,
        status: 'pending',
        verification_data: {
          nin: nin,
          selfie: selfieImage,
          dojah_response: ninData
        }
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to store verification' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Verification submitted successfully' });
  } catch (error) {
    console.error('NIN verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}