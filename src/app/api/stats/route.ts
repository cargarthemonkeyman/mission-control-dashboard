import { NextResponse } from 'next/server';

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || 'https://flexible-dolphin-499.convex.cloud';

export async function GET() {
  try {
    const response = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'activities:getStats',
        args: {}
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Convex error:', response.status, errorText);
      throw new Error(`Convex error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      total: 0,
      last24h: 0,
      last7d: 0,
      byType: {}
    }, { status: 500 });
  }
}
