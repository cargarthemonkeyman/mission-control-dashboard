import { NextResponse } from 'next/server';

const CONVEX_URL = 'https://flexible-dolphin-499.convex.cloud';

export async function GET() {
  try {
    const response = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'activities:getAll',
        args: { limit: 50 }
      })
    });

    if (!response.ok) {
      throw new Error(`Convex error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json([], { status: 500 });
  }
}