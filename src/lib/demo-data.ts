import { useState, useEffect } from 'react';

// Demo mode when Convex is not properly configured
const DEMO_MODE = true;

export interface Activity {
  _id: string;
  type: string;
  description: string;
  timestamp: number;
  agent: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface ScheduledTask {
  _id: string;
  title: string;
  description?: string;
  scheduledFor: number;
  duration?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
}

// Demo data
const demoActivities: Activity[] = [
  {
    _id: '1',
    type: 'task_completed',
    description: 'Built Mission Control dashboard',
    timestamp: Date.now() - 1000 * 60 * 30,
    agent: 'Ray',
    source: 'OpenClaw',
  },
  {
    _id: '2',
    type: 'file_created',
    description: 'Created ActivityFeed component',
    timestamp: Date.now() - 1000 * 60 * 60,
    agent: 'Ray',
    source: 'VS Code',
  },
  {
    _id: '3',
    type: 'scheduled_task_created',
    description: 'Deploy to Vercel scheduled',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    agent: 'Ray',
  },
  {
    _id: '4',
    type: 'system_event',
    description: 'Dashboard deployed successfully',
    timestamp: Date.now() - 1000 * 60 * 15,
    agent: 'System',
  },
];

const demoTasks: ScheduledTask[] = [
  {
    _id: '1',
    title: 'Review dashboard',
    description: 'Check all features working',
    scheduledFor: Date.now() + 1000 * 60 * 60 * 24,
    duration: 30,
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    _id: '2',
    title: 'Add more activities',
    scheduledFor: Date.now() + 1000 * 60 * 60 * 48,
    duration: 60,
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

export function useActivities(limit: number = 50) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setActivities(demoActivities.slice(0, limit));
      setLoading(false);
    }, 500);
  }, [limit]);

  return { activities, loading };
}

export function useScheduledTasks() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTasks(demoTasks);
      setLoading(false);
    }, 500);
  }, []);

  return { tasks, loading };
}

export function useActivityStats() {
  const [stats, setStats] = useState({
    total: 4,
    last24h: 4,
    last7d: 4,
    byType: {
      task_completed: 1,
      file_created: 1,
      scheduled_task_created: 1,
      system_event: 1,
    },
  });

  return { stats, loading: false };
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState({
    activities: [] as Activity[],
    tasks: [] as ScheduledTask[],
    totalResults: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ activities: [], tasks: [], totalResults: 0 });
      return;
    }

    setLoading(true);
    setTimeout(() => {
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
    }, 300);
  }, [query]);

  return { ...results, loading };
}