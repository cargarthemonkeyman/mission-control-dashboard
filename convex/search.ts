import { v } from "convex/values";
import { query } from "./_generated/server";

// Search across activities and scheduled tasks
export const globalSearch = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    const limit = args.limit ?? 20;
    
    // Search activities
    const activities = await ctx.db
      .query("activities")
      .collect();
    
    const matchingActivities = activities
      .filter(a => 
        a.description.toLowerCase().includes(searchTerm) ||
        a.type.toLowerCase().includes(searchTerm) ||
        (a.source && a.source.toLowerCase().includes(searchTerm))
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    
    // Search scheduled tasks
    const tasks = await ctx.db
      .query("scheduledTasks")
      .collect();
    
    const matchingTasks = tasks
      .filter(t =>
        t.title.toLowerCase().includes(searchTerm) ||
        (t.description && t.description.toLowerCase().includes(searchTerm)) ||
        t.status.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.scheduledFor - a.scheduledFor)
      .slice(0, limit);
    
    return {
      activities: matchingActivities,
      tasks: matchingTasks,
      totalResults: matchingActivities.length + matchingTasks.length,
    };
  },
});

// Get recent items for dashboard
export const getRecentItems = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
    
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduledFor")
      .order("desc")
      .take(limit);
    
    return {
      activities,
      tasks,
    };
  },
});