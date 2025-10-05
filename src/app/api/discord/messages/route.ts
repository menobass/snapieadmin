import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;

    if (!botToken || !channelId) {
      return NextResponse.json(
        { error: 'Discord configuration missing' },
        { status: 500 }
      );
    }

    // Fetch last 50 messages from the Discord channel
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=50`,
      {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Discord API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Discord messages' },
        { status: response.status }
      );
    }

    const messages = await response.json();
    
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Discord messages proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
