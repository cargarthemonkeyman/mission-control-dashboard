"use client";

import { useWeekView } from "@/lib/useData";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  addHours,
  getHours,
  getMinutes,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle, Circle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarViewProps {
  className?: string;
  compact?: boolean;
}

export function CalendarView({ className, compact = false }: CalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { tasks, loading } = useWeekView(currentWeek.getTime());

  const weekDays = useMemo(() => {
    return DAYS.map((_, index) => addDays(currentWeek, index));
  }, [currentWeek]);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => addDays(prev, direction === "prev" ? -7 : 7));
  };

  const getTaskPosition = (task: { scheduledFor: number; duration?: number }) => {
    const date = new Date(task.scheduledFor);
    const hour = getHours(date);
    const minute = getMinutes(date);
    const top = (hour + minute / 60) * 60;
    const height = ((task.duration || 60) / 60) * 60;
    return { top, height };
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(new Date(task.scheduledFor), day));
  };

  const statusIcons = {
    pending: <Circle className="w-3 h-3" />,
    in_progress: <Clock className="w-3 h-3" />,
    completed: <CheckCircle className="w-3 h-3" />,
    cancelled: <X className="w-3 h-3" />,
  };

  const statusColors = {
    pending: "border-l-amber-400 bg-amber-400/10",
    in_progress: "border-l-cyan-400 bg-cyan-400/10",
    completed: "border-l-emerald-400 bg-emerald-400/10",
    cancelled: "border-l-red-400 bg-red-400/10",
  };

  if (compact) {
    return (
      <div className={cn("bg-mission-surface rounded-lg border border-mission-border overflow-hidden", className)}>
        <div className="px-4 py-3 border-b border-mission-border flex items-center justify-between">
          <h3 className="font-semibold text-mission-text">This Week</h3>
          <div className="flex gap-1">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-1 hover:bg-mission-border/30 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateWeek("next")}
              className="p-1 hover:bg-mission-border/30 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-4 grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={index} className="text-center">
                <div className={cn(
                  "text-xs font-medium mb-1",
                  isToday ? "text-mission-accent" : "text-mission-muted"
                )}>
                  {DAYS[index]}
                </div>
                <div className={cn(
                  "w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium",
                  isToday 
                    ? "bg-mission-accent text-mission-bg" 
                    : "text-mission-text hover:bg-mission-border/30"
                )}>
                  {format(day, "d")}
                </div>
                {dayTasks.length > 0 && (
                  <div className="mt-2 flex justify-center gap-0.5">
                    {dayTasks.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-mission-accent" />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-mission-muted ml-0.5">+</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-mission-surface rounded-lg border border-mission-border overflow-hidden flex flex-col h-[calc(100vh-200px)]", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-mission-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-mission-text">
            {format(currentWeek, "MMMM yyyy")}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-1.5 hover:bg-mission-border/30 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="px-3 py-1.5 text-sm hover:bg-mission-border/30 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek("next")}
              className="p-1.5 hover:bg-mission-border/30 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-mission-accent text-mission-bg rounded-lg hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Task</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-mission-accent" />
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-mission-border sticky top-0 bg-mission-surface z-10">
              <div className="p-3 border-r border-mission-border">
                <span className="text-xs font-medium text-mission-muted">Time</span>
              </div>
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 text-center border-r border-mission-border last:border-r-0",
                      isToday && "bg-mission-accent/5"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium",
                      isToday ? "text-mission-accent" : "text-mission-text"
                    )}>
                      {DAYS[index]}
                    </div>
                    <div className={cn(
                      "text-xs mt-0.5",
                      isToday ? "text-mission-accent" : "text-mission-muted"
                    )}>
                      {format(day, "MMM d")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-8">
              {/* Time Labels */}
              <div className="border-r border-mission-border">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-mission-border/30 px-2 py-1"
                  >
                    <span className="text-xs text-mission-muted">
                      {format(addHours(startOfDay(new Date()), hour), "h a")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day, dayIndex) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "relative border-r border-mission-border last:border-r-0",
                      isToday && "bg-mission-accent/5"
                    )}
                  >
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-b border-mission-border/30"
                      />
                    ))}

                    {dayTasks.map((task) => {
                      const { top, height } = getTaskPosition(task);
                      return (
                        <div
                          key={task._id}
                          className={cn(
                            "absolute left-1 right-1 rounded border-l-2 p-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden",
                            statusColors[task.status as keyof typeof statusColors]
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${Math.max(height, 30)}px`,
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            {statusIcons[task.status as keyof typeof statusIcons]}
                            <span className="text-xs font-medium text-mission-text truncate">
                              {task.title}
                            </span>
                          </div>
                          {height > 40 && task.description && (
                            <p className="text-[10px] text-mission-muted mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}