"use client";

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
  {
    _id: "4",
    type: "scheduled_task_created",
    description: "Review Mission Control Dashboard scheduled",
    timestamp: Date.now() - 1000 * 60 * 2,
    agent: "Ray",
    source: "Mission Control",
  },
];

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

export function useActivities(limit: number = 50) {
  const [activities, setActivities] = useState(demoActivities.slice(0, limit));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from Convex API directly
    const fetchActivities = async () => {
      try {
        const response = await fetch('https://flexible-dolphin-499.convex.cloud/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'activities:getAll',
            args: { limit }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setActivities(data);
          }
        }
      } catch (e) {
        // Keep demo data on error
        console.log('Using demo data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [limit]);

  return { activities, loading };
}

export function useScheduledTasks() {
  const [tasks, setTasks] = useState(demoTasks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('https://flexible-dolphin-499.convex.cloud/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'scheduledTasks:getAll',
            args: {}
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setTasks(data);
          }
        }
      } catch (e) {
        console.log('Using demo tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { tasks, loading };
}

export function useActivityStats() {
  const [stats, setStats] = useState({
    total: 4,
    last24h: 4,
    last7d: 4,
    byType: {
      system_event: 1,
      task_completed: 1,
      file_created: 1,
      scheduled_task_created: 1,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://flexible-dolphin-499.convex.cloud/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'activities:getStats',
            args: {}
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setStats(data);
          }
        }
      } catch (e) {
        console.log('Using demo stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState({
    activities: [] as typeof demoActivities,
    tasks: [] as typeof demoTasks,
    totalResults: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ activities: [], tasks: [], totalResults: 0 });
      return;
    }

    setLoading(true);
    
    const search = async () => {
      try {
        const response = await fetch('https://flexible-dolphin-499.convex.cloud/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'search:globalSearch',
            args: { query, limit: 20 }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setResults(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fall through to demo search
      }
      
      // Demo search fallback
      const filteredActivities = demoActivities.filter(a =>
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.type.toLowerCase().includes(query.toLowerCase())
      );
      const filteredTasks = demoTasks.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
      );
      setResults({
        activities: filteredActivities,
        tasks: filteredTasks,
        totalResults: filteredActivities.length + filteredTasks.length,
      });
      setLoading(false);
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { ...results, loading };
}

export function useWeekView(weekStart: number) {
  const [tasks, setTasks] = useState(demoTasks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('https://flexible-dolphin-499.convex.cloud/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'scheduledTasks:getWeekView',
            args: { weekStart }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setTasks(data);
          }
        }
      } catch (e) {
        console.log('Using demo week view');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [weekStart]);

  return { tasks, loading };
}