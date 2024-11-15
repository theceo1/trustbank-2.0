import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { verificationType, data } = await request.json();
    
    if (!process.env.DOJAH_SANDBOX_KEY || !process.env.DOJAH_APP_ID) {
      throw new Error('Missing Dojah API credentials');
    }

    const response = await fetch('https://sandbox.dojah.io/api/v1/kyc/bvn/full', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DOJAH_SANDBOX_KEY}`,
        'AppId': process.env.DOJAH_APP_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bvn: data.verificationId
      })
    });

    if (!response.ok) {
      console.error('Dojah API error:', {
        status: response.status,
        statusText: response.statusText
      });
      
      return NextResponse.json({ 
        error: 'Verification service error',
        details: `API Error: ${response.status} ${response.statusText}`
      }, { status: response.status });
    }

    const responseData = await response.json();
    
    if (!responseData.entity) {
      return NextResponse.json({
        error: 'Invalid response format from verification service',
        details: responseData
      }, { status: 400 });
    }

    return NextResponse.json({
      entity: {
        bvn: data.verificationId,
        verified: true,
        first_name: responseData.entity.firstName,
        last_name: responseData.entity.lastName,
        dob: responseData.entity.dateOfBirth,
        phone_number: responseData.entity.phoneNumber1
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
