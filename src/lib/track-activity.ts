/**
 * Track Activity - Utility for Ray to log activities to Mission Control
 * 
 * Uso desde sesiones de OpenClaw:
 *   import { trackActivity } from './track-activity';
 *   await trackActivity({ description: "Fixeado bug", type: "task_completed" });
 */

const MISSION_CONTROL_URL = process.env.MISSION_CONTROL_URL || 'http://localhost:3000';

export interface ActivityInput {
  description: string;
  type?: 
    | 'task_completed' 
    | 'task_created' 
    | 'task_updated'
    | 'file_created'
    | 'file_updated'
    | 'file_deleted'
    | 'memory_updated'
    | 'tool_executed'
    | 'search_performed'
    | 'scheduled_task_created'
    | 'scheduled_task_completed'
    | 'agent_action'
    | 'system_event';
  agent?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export async function trackActivity(input: ActivityInput): Promise<void> {
  try {
    const response = await fetch(`${MISSION_CONTROL_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: input.type || 'agent_action',
        description: input.description,
        agent: input.agent || 'Ray',
        source: input.source || 'openclaw',
        metadata: input.metadata || {}
      })
    });

    if (!response.ok) {
      console.error('Failed to track activity:', response.status);
    } else {
      console.log('✓ Activity tracked:', input.description.slice(0, 50));
    }
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
}

// Auto-track on import if running as script
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    trackActivity({
      description: args[0],
      type: (args[1] as any) || 'agent_action',
      metadata: args[2] ? JSON.parse(args[2]) : {}
    });
  }
}
