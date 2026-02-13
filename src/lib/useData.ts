"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

// Demo data fallback
const demoActivities = [
  {
    _id: "1",
    type: "system_event",
    description: "Mission Control Dashboard deployed successfully",
    timestamp: Date.now() - 1000 * 60 * 5,
    agent: "Ray",
    source: "Vercel",
  },
  {
    _id: "2",
    type: "task_completed",
    description: "Built Activity Feed component",
    timestamp: Date.now() - 1000 * 60 * 30,
    agent: "Ray",
    source: "OpenClaw",
  },
  {
    _id: "3",
    type: "file_created",
    description: "Created dashboard layout and theme",
    timestamp: Date.now() - 1000 * 60 * 60,
    agent: "Ray",
    source: "VS Code",
  },
];

export function useActivities(limit: number = 50) {
  const convexActivities = useQuery(api.activities.getAll, { limit });
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    // If convex returns undefined after a timeout, switch to demo
    const timer = setTimeout(() => {
      if (convexActivities === undefined) {
        setUseDemo(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [convexActivities]);

  return {
    activities: useDemo ? demoActivities.slice(0, limit) : (convexActivities || []),
    loading: !useDemo && convexActivities === undefined,
    useDemo,
  };
}

const demoTasks = [
  {
    _id: "1",
    title: "Review dashboard",
    description: "Check all features working correctly",
    scheduledFor: Date.now() + 1000 * 60 * 60 * 24,
    duration: 30,
    status: "pending" as const,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    _id: "2",
    title: "Connect Convex functions",
    description: "Deploy backend functions to enable real-time updates",
    scheduledFor: Date.now() + 1000 * 60 * 60 * 2,
    duration: 60,
    status: "in_progress" as const,
    createdAt: Date.now() - 1000 * 60 * 15,
  },
];

export function useScheduledTasks() {
  const convexTasks = useQuery(api.scheduledTasks.getAll, {});
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (convexTasks === undefined) {
        setUseDemo(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [convexTasks]);

  return {
    tasks: useDemo ? demoTasks : (convexTasks || []),
    loading: !useDemo && convexTasks === undefined,
    useDemo,
  };
}

export function useActivityStats() {
  const convexStats = useQuery(api.activities.getStats);
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (convexStats === undefined) {
        setUseDemo(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [convexStats]);

  const demoStats = {
    total: 3,
    last24h: 3,
    last7d: 3,
    byType: {
      system_event: 1,
      task_completed: 1,
      file_created: 1,
    },
  };

  return {
    stats: useDemo ? demoStats : convexStats,
    loading: !useDemo && convexStats === undefined,
    useDemo,
  };
}

export function useGlobalSearch(query: string) {
  const convexResults = useQuery(
    api.search.globalSearch,
    query.length >= 2 ? { query, limit: 20 } : "skip"
  );
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 && convexResults === undefined) {
        setUseDemo(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [convexResults, query]);

  const demoSearch = () => {
    if (!query || query.length < 2) {
      return { activities: [], tasks: [], totalResults: 0 };
    }
    const filteredActivities = demoActivities.filter(a =>
      a.description.toLowerCase().includes(query.toLowerCase())
    );
    const filteredTasks = demoTasks.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
    );
    return {
      activities: filteredActivities,
      tasks: filteredTasks,
      totalResults: filteredActivities.length + filteredTasks.length,
    };
  };

  const results = useDemo ? demoSearch() : (convexResults || { activities: [], tasks: [], totalResults: 0 });

  return {
    ...results,
    loading: !useDemo && query.length >= 2 && convexResults === undefined,
    useDemo,
  };
}

// For week view in calendar
export function useWeekView(weekStart: number) {
  const convexTasks = useQuery(api.scheduledTasks.getWeekView, { weekStart });
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (convexTasks === undefined) {
        setUseDemo(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [convexTasks]);

  return {
    tasks: useDemo ? demoTasks : (convexTasks || []),
    loading: !useDemo && convexTasks === undefined,
    useDemo,
  };
}