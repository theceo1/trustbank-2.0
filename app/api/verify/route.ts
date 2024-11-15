import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { verificationType, data } = await request.json();
    
    if (!process.env.DOJAH_SANDBOX_KEY || !process.env.DOJAH_APP_ID) {
      throw new Error('Missing Dojah API credentials');
    }

    const response = await fetch('https://api.dojah.io/api/v1/kyc/bvn', {
      method: 'POST',
      headers: {
        'Authorization': process.env.DOJAH_SANDBOX_KEY,
        'AppId': process.env.DOJAH_APP_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bvn: data.verificationId
      })
    });

    const responseText = await response.text();
    console.log('Dojah API Response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Dojah response:', e);
      return NextResponse.json({ 
        error: 'Invalid response from verification service',
        details: responseText
      }, { status: 500 });
    }

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Verification service error',
        details: responseData
      }, { status: response.status });
    }

    return NextResponse.json({
      entity: {
        bvn: data.verificationId,
        verified: true,
        first_name: responseData.entity?.first_name,
        last_name: responseData.entity?.last_name,
        dob: responseData.entity?.dob,
        phone_number: responseData.entity?.mobile
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
