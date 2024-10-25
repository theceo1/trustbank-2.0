import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { verificationType, data } = await request.json();
    
    // Log request details
    console.log('Verification request:', {
      verificationType,
      bvn: data.verificationId,
      apiKey: process.env.DOJAH_SANDBOX_KEY?.substring(0, 10) + '...',
      appId: process.env.DOJAH_APP_ID
    });

    // Make sure environment variables are set
    if (!process.env.DOJAH_SANDBOX_KEY || !process.env.DOJAH_APP_ID) {
      throw new Error('Missing Dojah API credentials');
    }

    const response = await fetch('https://sandbox.dojah.io/api/v1/kyc/bvn/basic', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DOJAH_SANDBOX_KEY}`,
        'AppId': process.env.DOJAH_APP_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Add API-Key header as well
        'API-Key': process.env.DOJAH_SANDBOX_KEY
      },
      body: JSON.stringify({
        bvn: data.verificationId
      }),
    });

    // Log response headers and status
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return NextResponse.json({ 
        error: 'Invalid API response',
        details: `Status: ${response.status}, Response: ${responseText.substring(0, 100)}...`
      }, { status: 500 });
    }

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Verification service error',
        details: responseData
      }, { status: response.status });
    }

    if (responseData.entity) {
      return NextResponse.json({
        entity: {
          bvn: data.verificationId,
          verified: true,
          ...responseData.entity
        }
      });
    }

    return NextResponse.json({ 
      error: 'Invalid response format',
      details: responseData
    }, { status: 400 });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
