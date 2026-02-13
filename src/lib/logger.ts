import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://flexible-dolphin-499.convex.cloud";

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(CONVEX_URL);
  }
  return convexClient;
}

export type ActivityType = 
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

export interface LogActivityInput {
  type: ActivityType;
  description: string;
  agent?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const client = getConvexClient();
    await client.mutation(api.activities.create, {
      type: input.type,
      description: input.description,
      agent: input.agent || "Ray",
      source: input.source || "OpenClaw",
      metadata: input.metadata || {},
    });
    console.log(`✅ Logged: ${input.description}`);
  } catch (error) {
    console.error("❌ Failed to log activity:", error);
    // Don't throw - logging should never break the main flow
  }
}

// Convenience helpers
export const activity = {
  completed: (desc: string, meta?: Record<string, any>) => 
    logActivity({ type: "task_completed", description: desc, metadata: meta }),
  
  created: (desc: string, meta?: Record<string, any>) => 
    logActivity({ type: "file_created", description: desc, metadata: meta }),
  
  updated: (desc: string, meta?: Record<string, any>) => 
    logActivity({ type: "file_updated", description: desc, metadata: meta }),
  
  deployed: (desc: string, meta?: Record<string, any>) => 
    logActivity({ type: "system_event", description: desc, metadata: meta }),
  
  search: (desc: string, meta?: Record<string, any>) => 
    logActivity({ type: "search_performed", description: desc, metadata: meta }),
  
  error: (desc: string, meta?: Record<string, any>) => 
    logActivity({ type: "system_event", description: `ERROR: ${desc}`, metadata: meta }),
};