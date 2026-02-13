"use client";

import { useActivityStats, useScheduledTasks, useWeekView } from "@/lib/useData";
import { Activity, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { stats, loading } = useActivityStats();
  const { tasks } = useScheduledTasks();

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
      value: stats?.total ?? 0,
      change: `+${stats?.last24h ?? 0} today`,
      icon: Activity,
      color: "text-mission-accent",
      bgColor: "bg-mission-accent/10",
    },
    {
      title: "This Week",
      value: stats?.last7d ?? 0,
      change: "activities",
      icon: Clock,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Upcoming Tasks",
      value: tasks?.length ?? 0,
      change: "scheduled",
      icon: Calendar,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      title: "Completed",
      value: (stats?.byType as Record<string, number>)?.task_completed ?? 0,
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