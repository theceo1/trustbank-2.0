import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { verificationType, data } = await request.json();
    
    if (!process.env.DOJAH_SANDBOX_KEY || !process.env.DOJAH_APP_ID) {
      throw new Error('Missing Dojah API credentials');
    }

    const endpoint = verificationType === 'bvn'
      ? 'https://api.dojah.io/api/v1/kyc/bvn'
      : verificationType === 'nin'
      ? 'https://api.dojah.io/api/v1/kyc/nin/verify'
      : verificationType === 'drivers_license'
      ? 'https://api.dojah.io/api/v1/kyc/dl'
      : 'https://api.dojah.io/api/v1/kyc/passport';

    console.log('Making request to:', endpoint);

    const requestBody = verificationType === 'nin'
      ? {
          nin: data.verificationId,
          first_name: "John",
          last_name: "Doe",
          selfie_image: data.selfie_image
        }
      : {
          [verificationType]: data.verificationId,
          selfie_image: data.selfie_image
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': process.env.DOJAH_SANDBOX_KEY,
        'AppId': process.env.DOJAH_APP_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Response text:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error('Parse error:', error);
      return NextResponse.json({ 
        error: 'Invalid response format',
        details: responseText.substring(0, 100)
      }, { status: 500 });
    }

    if (!response.ok || responseData.error) {
      return NextResponse.json({ 
        error: responseData.error || 'Verification service error',
        details: responseData
      }, { status: response.status });
    }

    return NextResponse.json({
      entity: {
        verified: true,
        ...responseData.entity
      }
    });

  } catch (error) {
    console.error('Error in verification process:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
