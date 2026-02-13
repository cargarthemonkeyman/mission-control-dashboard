"use client";

import { useEffect, useState, useCallback } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface Activity {
  _id: string;
  type: string;
  description: string;
  timestamp: number;
  agent: string;
  source?: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function ActivityFeed({ limit = 50, showHeader = true, className }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/activities');
      
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setActivities(data);
          setLastUpdated(new Date());
        }
      }
    } catch (e) {
      console.log('Failed to fetch activities:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto-refresh every 10 seconds (silently, without page reload)
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      fetchActivities();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchActivities, isLive]);

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = format(activity.timestamp, "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

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
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-mission-muted">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
            <button
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors",
                isLive ? "bg-emerald-500/20 text-emerald-400" : "bg-mission-border/30 text-mission-muted"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", isLive && "animate-pulse bg-emerald-500")} />
              {isLive ? "Live" : "Paused"}
            </button>
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="p-1.5 hover:bg-mission-border/30 rounded-lg transition-colors"
              title="Refresh now"
            >
              <RefreshCw className={cn("w-4 h-4 text-mission-muted", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto">
        {loading && activities.length === 0 ? (
          <div className="p-8 text-center text-mission-muted">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
            <p>Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-mission-muted">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activities yet</p>
            <button
              onClick={fetchActivities}
              className="mt-4 px-4 py-2 bg-mission-accent text-mission-bg rounded-lg text-sm hover:bg-cyan-400 transition-colors"
            >
              Refresh
            </button>
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
                    className="px-4 py-3 hover:bg-mission-bg/30 transition-colors"
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
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                          <div className="mt-2 p-2 rounded bg-mission-bg/50 text-xs text-mission-muted font-mono overflow-x-auto">
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