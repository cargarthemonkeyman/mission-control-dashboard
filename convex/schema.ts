import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    type: v.union(
      v.literal("task_completed"),
      v.literal("task_created"),
      v.literal("task_updated"),
      v.literal("file_created"),
      v.literal("file_updated"),
      v.literal("file_deleted"),
      v.literal("memory_updated"),
      v.literal("tool_executed"),
      v.literal("search_performed"),
      v.literal("scheduled_task_created"),
      v.literal("scheduled_task_completed"),
      v.literal("agent_action"),
      v.literal("system_event")
    ),
    description: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
    timestamp: v.number(),
    agent: v.string(),
    source: v.optional(v.string()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"])
    .index("by_agent", ["agent"]),

  scheduledTasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    duration: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    recurrence: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_scheduledFor", ["scheduledFor"])
    .index("by_status", ["status"])
    .index("by_date_range", ["scheduledFor", "status"]),

  searchIndex: defineTable({
    content: v.string(),
    type: v.union(
      v.literal("activity"),
      v.literal("scheduledTask"),
      v.literal("memory")
    ),
    referenceId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_content", ["content"])
    .index("by_type", ["type"])
    .index("by_reference", ["referenceId"]),
});