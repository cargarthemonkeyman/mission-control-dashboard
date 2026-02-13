// Activity logging utilities for OpenClaw integration
// Use this to log activities from your agent to Mission Control

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export interface ActivityInput {
  type: 
    | "task_completed"
    | "task_created"
    | "task_updated"
    | "file_created"
    | "file_updated"
    | "file_deleted"
    | "memory_updated"
    | "tool_executed"
    | "search_performed"
    | "scheduled_task_created"
    | "scheduled_task_completed"
    | "agent_action"
    | "system_event";
  description: string;
  metadata?: Record<string, any>;
  agent: string;
  source?: string;
}

export async function logActivity(activity: ActivityInput): Promise<void> {
  if (!CONVEX_URL) {
    console.warn("CONVE_URL not set, skipping activity log");
    return;
  }

  try {
    const response = await fetch(`${CONVEX_URL}/api/mutate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "activities:create",
        args: {
          ...activity,
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// Convenience methods
export const activityLogger = {
  taskCompleted: (description: string, agent: string, metadata?: Record<string, any>) =>
    logActivity({ type: "task_completed", description, agent, metadata }),
  
  fileCreated: (description: string, agent: string, metadata?: Record<string, any>) =>
    logActivity({ type: "file_created", description, agent, metadata }),
  
  fileUpdated: (description: string, agent: string, metadata?: Record<string, any>) =>
    logActivity({ type: "file_updated", description, agent, metadata }),
  
  memoryUpdated: (description: string, agent: string, metadata?: Record<string, any>) =>
    logActivity({ type: "memory_updated", description, agent, metadata }),
  
  toolExecuted: (description: string, agent: string, source: string, metadata?: Record<string, any>) =>
    logActivity({ type: "tool_executed", description, agent, source, metadata }),
  
  searchPerformed: (description: string, agent: string, metadata?: Record<string, any>) =>
    logActivity({ type: "search_performed", description, agent, metadata }),
  
  agentAction: (description: string, agent: string, metadata?: Record<string, any>) =>
    logActivity({ type: "agent_action", description, agent, metadata }),
};