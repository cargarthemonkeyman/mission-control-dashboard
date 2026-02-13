import { NextResponse } from 'next/server';

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || 'https://flexible-dolphin-499.convex.cloud';

export async function GET() {
  try {
    const response = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'scheduledTasks:getUpcoming',
        args: { limit: 10 }
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
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ value: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'scheduledTasks:create',
        args: {
          title: body.title,
          description: body.description,
          scheduledFor: body.scheduledFor || Date.now() + 3600000,
          duration: body.duration,
          recurrence: body.recurrence,
          metadata: body.metadata || {}
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Convex mutation error:', response.status, errorText);
      throw new Error(`Convex error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
