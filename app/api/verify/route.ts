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

    console.log('Making Dojah request:', {
      endpoint,
      hasCredentials: {
        apiKey: process.env.DOJAH_API_KEY?.substring(0, 10) + '...',
        appId: process.env.DOJAH_APP_ID
      },
      requestData: {
        hasNin: !!data.nin,
        hasSelfie: !!data.selfie_image,
        ninLength: data.nin?.length
      }
    });

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

    const responseText = await response.text();
    console.log('Raw Dojah Response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      return NextResponse.json({ error: 'Invalid API response' }, { status: 500 });
    }

    console.log('Dojah Response:', {
      status: response.status,
      data: responseData
    });

    if (!response.ok || !responseData) {
      console.error('Dojah API Error:', {
        status: response.status,
        data: responseData
      });
      return NextResponse.json({ 
        error: responseData?.error || 'Verification failed' 
      }, { status: response.status });
    }

    // Store verification attempt in Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      try {
        // First, store the verification attempt
        const { error: attemptError } = await supabase
          .from('verification_attempts')
          .insert({
            user_id: user.id,
            verification_type: 'nin',
            status: responseData.entity?.verified ? 'success' : 'failed',
            response_data: responseData
          });

        if (attemptError) {
          console.error('Error storing verification attempt:', attemptError);
        }

        // Then, update or insert KYC verification
        const { error: verificationError } = await supabase
          .from('kyc_verifications')
          .upsert({
            user_id: user.id,
            level: 1,
            status: responseData.entity?.verified ? 'verified' : 'failed',
            verification_type: 'nin',
            verification_data: responseData,
            verified_at: responseData.entity?.verified ? new Date().toISOString() : null
          }, {
            onConflict: 'user_id'
          });

        if (verificationError) {
          console.error('Error updating KYC verification:', verificationError);
        }
      } catch (error) {
        console.error('Database operation error:', error);
      }
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
