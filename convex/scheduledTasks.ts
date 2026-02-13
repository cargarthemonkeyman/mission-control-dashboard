import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to get all scheduled tasks
export const getAll = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    
    if (args.status) {
      const tasks = await ctx.db
        .query("scheduledTasks")
        .withIndex("by_status")
        .filter((q) => q.eq(q.field("status"), args.status))
        .order("desc")
        .take(limit);
      return tasks;
    }
    
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduledFor")
      .order("desc")
      .take(limit);
    return tasks;
  },
});

// Query to get tasks for a specific week
export const getWeekView = query({
  args: {
    weekStart: v.number(), // timestamp for start of week (Monday)
  },
  handler: async (ctx, args) => {
    const weekEnd = args.weekStart + 7 * 24 * 60 * 60 * 1000;
    
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduledFor")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledFor"), args.weekStart),
          q.lt(q.field("scheduledFor"), weekEnd)
        )
      )
      .order("asc")
      .collect();
    
    return tasks;
  },
});

// Query to get tasks by date range
export const getByDateRange = query({
  args: {
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduledFor")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledFor"), args.start),
          q.lt(q.field("scheduledFor"), args.end)
        )
      )
      .order("asc")
      .collect();
    return tasks;
  },
});

// Query to get upcoming tasks
export const getUpcoming = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const now = Date.now();
    
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduledFor")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledFor"), now),
          q.eq(q.field("status"), "pending")
        )
      )
      .order("asc")
      .take(limit);
    return tasks;
  },
});

// Mutation to create a scheduled task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    duration: v.optional(v.number()),
    recurrence: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("scheduledTasks", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    return taskId;
  },
});

// Mutation to update a scheduled task
export const update = mutation({
  args: {
    id: v.id("scheduledTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    duration: v.optional(v.number()),
    recurrence: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to mark task as complete
export const markComplete = mutation({
  args: {
    id: v.id("scheduledTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to mark task as in progress
export const markInProgress = mutation({
  args: {
    id: v.id("scheduledTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "in_progress",
      updatedAt: Date.now(),
    });
  },
});

// Mutation to cancel a task
export const cancel = mutation({
  args: {
    id: v.id("scheduledTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete a task
export const remove = mutation({
  args: {
    id: v.id("scheduledTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});