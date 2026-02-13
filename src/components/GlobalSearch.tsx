"use client";

import { useGlobalSearch } from "@/lib/useData";
import { Search, X, Calendar, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface GlobalSearchProps {
  className?: string;
  compact?: boolean;
}

export function GlobalSearch({ className, compact = false }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { activities, tasks, totalResults, loading } = useGlobalSearch(debouncedQuery);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length >= 2);
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-mission-accent/30 text-mission-accent rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mission-muted" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Search activities, tasks..."
            className="w-full pl-10 pr-10 py-2 bg-mission-surface border border-mission-border rounded-lg text-sm text-mission-text placeholder:text-mission-muted focus:outline-none focus:ring-2 focus:ring-mission-accent/50"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-mission-border/30 rounded"
            >
              <X className="w-3 h-3 text-mission-muted" />
            </button>
          )}
        </div>

        {isOpen && debouncedQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-mission-surface border border-mission-border rounded-lg shadow-xl z-50 max-h-[400px] overflow-auto">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-mission-accent" />
              </div>
            ) : totalResults === 0 ? (
              <div className="p-4 text-center text-mission-muted">
                <Search className="w-5 h-5 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found</p>
              </div>
            ) : (
              <>
                {activities.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-mission-muted uppercase tracking-wide px-2 py-1">
                      Activities ({activities.length})
                    </h4>
                    {activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity._id}
                        className="px-2 py-2 hover:bg-mission-bg/50 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <Activity className="w-4 h-4 text-mission-accent mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-mission-text truncate">
                              {highlightMatch(activity.description, debouncedQuery)}
                            </p>
                            <p className="text-xs text-mission-muted">
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tasks.length > 0 && (
                  <div className="p-2 border-t border-mission-border/50">
                    <h4 className="text-xs font-medium text-mission-muted uppercase tracking-wide px-2 py-1">
                      Tasks ({tasks.length})
                    </h4>
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task._id}
                        className="px-2 py-2 hover:bg-mission-bg/50 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-emerald-400 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-mission-text truncate">
                              {highlightMatch(task.title, debouncedQuery)}
                            </p>
                            <p className="text-xs text-mission-muted">
                              {format(task.scheduledFor, "MMM d, h:mm a")} • {task.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                  className="block p-3 text-center text-sm text-mission-accent hover:bg-mission-bg/50 border-t border-mission-border"
                  onClick={() => setIsOpen(false)}
                >
                  View all results →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mission-muted" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search across activities, tasks, and memory..."
          autoFocus
          className="w-full pl-12 pr-12 py-4 bg-mission-surface border border-mission-border rounded-xl text-lg text-mission-text placeholder:text-mission-muted focus:outline-none focus:ring-2 focus:ring-mission-accent/50"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-mission-border/30 rounded-lg"
          >
            <X className="w-5 h-5 text-mission-muted" />
          </button>
        )}
      </div>

      {debouncedQuery.length >= 2 && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-mission-accent" />
            </div>
          ) : totalResults === 0 ? (
            <div className="p-12 text-center text-mission-muted">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No results found for &quot;{debouncedQuery}&quot;</p>
            </div>
          ) : (
            <>
              <p className="text-mission-muted">
                Found {totalResults} results
              </p>

              {activities.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-mission-text mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-mission-accent" />
                    Activities ({activities.length})
                  </h2>
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div
                        key={activity._id}
                        className="p-4 bg-mission-surface border border-mission-border rounded-lg hover:border-mission-accent/50 transition-colors"
                      >
                        <p className="text-mission-text">
                          {highlightMatch(activity.description, debouncedQuery)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-mission-muted">
                          <span>{format(activity.timestamp, "MMM d, yyyy h:mm a")}</span>
                          <span className="px-2 py-0.5 rounded-full bg-mission-border/30 text-xs">
                            {activity.agent}
                          </span>
                          <span className="text-xs capitalize">{activity.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tasks.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-mission-text mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    Scheduled Tasks ({tasks.length})
                  </h2>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        className="p-4 bg-mission-surface border border-mission-border rounded-lg hover:border-emerald-400/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-mission-text font-medium">
                              {highlightMatch(task.title, debouncedQuery)}
                            </p>
                            {task.description && (
                              <p className="text-mission-muted text-sm mt-1">
                                {highlightMatch(task.description, debouncedQuery)}
                              </p>
                            )}
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            (task.status as string) === "completed" && "bg-emerald-400/10 text-emerald-400",
                            (task.status as string) === "pending" && "bg-amber-400/10 text-amber-400",
                            (task.status as string) === "in_progress" && "bg-cyan-400/10 text-cyan-400",
                            (task.status as string) === "cancelled" && "bg-red-400/10 text-red-400"
                          )}>
                            {task.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-mission-muted">
                          <span>{format(task.scheduledFor, "MMM d, yyyy h:mm a")}</span>
                          {task.duration && <span>{task.duration} min</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}