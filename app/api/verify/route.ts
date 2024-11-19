//app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { verificationType, data } = await request.json();
    
    if (!process.env.DOJAH_API_KEY || !process.env.DOJAH_APP_ID) {
      throw new Error('Missing Dojah API credentials');
    }

    const endpoint = 'https://api.dojah.io/api/v1/kyc/nin/verify';
    const requestBody = {
      nin: data.nin,
      selfie_image: data.selfie_image
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': process.env.DOJAH_API_KEY,
        'AppId': process.env.DOJAH_APP_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    
    // Store verification attempt in Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isVerified = responseData.entity && Object.keys(responseData.entity).length > 0;
    const verificationStatus = isVerified ? 'verified' as const : 'failed' as const;

    try {
      // First, store the verification attempt
      await supabase
        .from('verification_attempts')
        .insert({
          user_id: user.id,
          verification_type: 'nin',
          status: verificationStatus,
          response_data: responseData
        });

      // Then, update KYC verification
      const { error: verificationError } = await supabase
        .from('kyc_verifications')
        .upsert({
          user_id: user.id,
          level: 1,
          status: verificationStatus,
          verification_type: 'nin',
          verification_data: responseData,
          verified_at: isVerified ? new Date().toISOString() : null
        });

      if (verificationError) {
        console.error('Error updating KYC verification:', verificationError);
        throw verificationError;
      }

    } catch (error) {
      console.error('Database operation error:', error);
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
