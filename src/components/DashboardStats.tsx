"use client";

import { useEffect, useState } from "react";
import { Activity, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  last24h: number;
  last7d: number;
  byType: Record<string, number>;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    last24h: 0,
    last7d: 0,
    byType: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setStats(data);
          }
        }
      } catch (e) {
        console.log('Failed to fetch stats:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-mission-surface rounded-lg border border-mission-border p-4 flex items-center justify-center h-24">
            <Loader2 className="w-6 h-6 animate-spin text-mission-accent" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Activities",
      value: stats.total,
      change: `+${stats.last24h} today`,
      icon: Activity,
      color: "text-mission-accent",
      bgColor: "bg-mission-accent/10",
    },
    {
      title: "This Week",
      value: stats.last7d,
      change: "activities",
      icon: Clock,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Upcoming Tasks",
      value: 0, // TODO: Add tasks API
      change: "scheduled",
      icon: Calendar,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      title: "Completed",
      value: stats.byType?.task_completed || 0,
      change: "tasks done",
      icon: CheckCircle,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-mission-surface rounded-lg border border-mission-border p-4 hover:border-mission-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-mission-muted">{card.title}</p>
                <p className="text-2xl font-bold text-mission-text mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-mission-muted mt-1">{card.change}</p>
              </div>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <Icon className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}