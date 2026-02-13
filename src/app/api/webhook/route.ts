import { NextResponse } from 'next/server';

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || 'https://flexible-dolphin-499.convex.cloud';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * Webhook para auto-tracking desde OpenClaw u otros sistemas
 * 
 * POST /api/webhook
 * Headers: Authorization: Bearer <secret> (opcional si WEBHOOK_SECRET está set)
 * Body: {
 *   type: 'task_completed' | 'tool_executed' | etc,
 *   description: string,
 *   agent?: string,
 *   source?: string,
 *   metadata?: object,
 *   timestamp?: number
 * }
 */
export async function POST(request: Request) {
  try {
    // Verificar secret si está configurado
    if (WEBHOOK_SECRET) {
      const auth = request.headers.get('authorization');
      const token = auth?.replace('Bearer ', '');
      if (token !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.description) {
      return NextResponse.json({ error: 'Description required' }, { status: 400 });
    }

    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'activities:create',
        args: {
          type: body.type || 'agent_action',
          description: body.description,
          agent: body.agent || 'Ray',
          source: body.source || 'webhook',
          metadata: body.metadata || {},
          timestamp: body.timestamp || Date.now()
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Convex mutation error:', response.status, errorText);
      throw new Error(`Convex error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, id: data.value });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

// Batch processing - permite enviar múltiples actividades a la vez
export async function PUT(request: Request) {
  try {
    if (WEBHOOK_SECRET) {
      const auth = request.headers.get('authorization');
      const token = auth?.replace('Bearer ', '');
      if (token !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { activities } = await request.json();
    
    if (!Array.isArray(activities)) {
      return NextResponse.json({ error: 'activities must be an array' }, { status: 400 });
    }

    const results = [];
    for (const activity of activities) {
      const response = await fetch(`${CONVEX_URL}/api/mutation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'activities:create',
          args: {
            type: activity.type || 'agent_action',
            description: activity.description,
            agent: activity.agent || 'Ray',
            source: activity.source || 'webhook_batch',
            metadata: activity.metadata || {},
            timestamp: activity.timestamp || Date.now()
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        results.push(data.value);
      }
    }

    return NextResponse.json({ success: true, count: results.length, ids: results });
  } catch (error) {
    console.error('Batch webhook error:', error);
    return NextResponse.json({ error: 'Failed to process batch' }, { status: 500 });
  }
}
