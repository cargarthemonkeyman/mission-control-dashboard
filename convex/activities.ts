import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to get all activities, sorted by timestamp descending
export const getAll = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
    return activities;
  },
});

// Query to get recent activities
export const getRecent = query({
  args: {
    hours: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hours ?? 24;
    const limit = args.limit ?? 50;
    const since = Date.now() - hours * 60 * 60 * 1000;
    
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .order("desc")
      .take(limit);
    return activities;
  },
});

// Query to get activities by type
export const getByType = query({
  args: {
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_type")
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .take(limit);
    return activities;
  },
});

// Mutation to create a new activity
export const create = mutation({
  args: {
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
    agent: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activities", {
      ...args,
      timestamp: Date.now(),
    });
    return activityId;
  },
});

// Mutation to delete an activity
export const remove = mutation({
  args: {
    id: v.id("activities"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Query to get activity stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const last7d = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const allActivities = await ctx.db
      .query("activities")
      .collect();
    
    const last24hActivities = allActivities.filter(a => a.timestamp >= last24h);
    const last7dActivities = allActivities.filter(a => a.timestamp >= last7d);
    
    const typeCount = allActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: allActivities.length,
      last24h: last24hActivities.length,
      last7d: last7dActivities.length,
      byType: typeCount,
    };
  },
});