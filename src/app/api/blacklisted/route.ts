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

export async function POST(request: NextRequest) {
  try {
    // Get the JWT token from Authorization header
    const authorization = request.headers.get('authorization');
    
    // Get the request body
    const body = await request.json();
    
    const response = await fetch('https://menosoft.xyz/api/blacklisted', {
      method: 'POST',
      headers: {
        'Authorization': authorization || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    } else {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to add user' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Add user proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the JWT token from Authorization header
    const authorization = request.headers.get('authorization');
    
    // Get username from URL search params
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`https://menosoft.xyz/api/blacklisted?username=${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization || '',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    } else {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to delete user' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Delete user proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}