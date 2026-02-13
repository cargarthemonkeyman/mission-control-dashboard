"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  FileText,
  Brain,
  Wrench,
  Search,
  Calendar,
  Bot,
  AlertCircle,
  Plus,
  Edit,
  Trash,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const activityIcons: Record<string, React.ReactNode> = {
  task_completed: <CheckCircle className="w-4 h-4" />,
  task_created: <Plus className="w-4 h-4" />,
  task_updated: <Edit className="w-4 h-4" />,
  file_created: <FileText className="w-4 h-4" />,
  file_updated: <Edit className="w-4 h-4" />,
  file_deleted: <Trash className="w-4 h-4" />,
  memory_updated: <Brain className="w-4 h-4" />,
  tool_executed: <Wrench className="w-4 h-4" />,
  search_performed: <Search className="w-4 h-4" />,
  scheduled_task_created: <Calendar className="w-4 h-4" />,
  scheduled_task_completed: <CheckCircle className="w-4 h-4" />,
  agent_action: <Bot className="w-4 h-4" />,
  system_event: <AlertCircle className="w-4 h-4" />,
};

const activityColors: Record<string, string> = {
  task_completed: "text-emerald-400 bg-emerald-400/10",
  task_created: "text-blue-400 bg-blue-400/10",
  task_updated: "text-amber-400 bg-amber-400/10",
  file_created: "text-cyan-400 bg-cyan-400/10",
  file_updated: "text-amber-400 bg-amber-400/10",
  file_deleted: "text-red-400 bg-red-400/10",
  memory_updated: "text-purple-400 bg-purple-400/10",
  tool_executed: "text-orange-400 bg-orange-400/10",
  search_performed: "text-pink-400 bg-pink-400/10",
  scheduled_task_created: "text-indigo-400 bg-indigo-400/10",
  scheduled_task_completed: "text-emerald-400 bg-emerald-400/10",
  agent_action: "text-cyan-400 bg-cyan-400/10",
  system_event: "text-red-400 bg-red-400/10",
};

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function ActivityFeed({ limit = 50, showHeader = true, className }: ActivityFeedProps) {
  const activities = useQuery(api.activities.getAll, { limit });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  // Group activities by date
  const groupedActivities = (activities || []).reduce((groups, activity) => {
    const date = format(activity.timestamp, "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={cn("bg-mission-surface rounded-lg border border-mission-border overflow-hidden", className)}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-mission-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-mission-accent" />
            <h2 className="font-semibold text-mission-text">Activity Feed</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-mission-muted">Live</span>
          </div>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto">
        {sortedDates.length === 0 ? (
          <div className="p-8 text-center text-mission-muted">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activities yet</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="border-b border-mission-border/50 last:border-b-0">
              <div className="px-4 py-2 bg-mission-bg/50 text-xs font-medium text-mission-muted uppercase tracking-wide">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="divide-y divide-mission-border/30">
                {groupedActivities[date]?.map((activity) => (
                  <div
                    key={activity._id}
                    className="px-4 py-3 hover:bg-mission-bg/30 transition-colors animate-fade-in"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                        activityColors[activity.type] || "text-mission-muted bg-mission-border/30"
                      )}>
                        {activityIcons[activity.type] || <MoreHorizontal className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-mission-text leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-mission-muted">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </span>
                          <span className="text-xs text-mission-muted">
                            {format(activity.timestamp, "h:mm a")}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-mission-border/30 text-mission-muted">
                            {activity.agent}
                          </span>
                          {activity.source && (
                            <span className="text-xs text-mission-accent truncate max-w-[150px]">
                              via {activity.source}
                            </span>
                          )}
                        </div>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 p-2 rounded bg-mission-bg/50 text-xs text-mission-muted font-mono">
                            {JSON.stringify(activity.metadata, null, 2).slice(0, 200)}
                            {JSON.stringify(activity.metadata).length > 200 && "..."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}