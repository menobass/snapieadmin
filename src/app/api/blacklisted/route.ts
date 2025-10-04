import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from Authorization header
    const authorization = request.headers.get('authorization');
    
    const response = await fetch('https://menosoft.xyz/api/blacklisted', {
      method: 'GET',
      headers: {
        'Authorization': authorization || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Blacklisted proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}