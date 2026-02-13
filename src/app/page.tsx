export const dynamic = 'force-dynamic';

"use client";

import { ActivityFeed } from "@/components/ActivityFeed";
import { CalendarView } from "@/components/CalendarView";
import { GlobalSearch } from "@/components/GlobalSearch";
import { DashboardStats } from "@/components/DashboardStats";
import { LayoutDashboard, Calendar, Search, Settings } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-mission-bg">
      {/* Header */}
      <header className="border-b border-mission-border bg-mission-surface/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-mission-accent flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-mission-bg" />
              </div>
              <h1 className="text-xl font-bold text-mission-text">Mission Control</h1>
            </div>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-2 rounded-lg text-mission-text bg-mission-border/30 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/calendar"
                className="px-3 py-2 rounded-lg text-mission-muted hover:text-mission-text hover:bg-mission-border/30 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Link>
              <Link
                href="/search"
                className="px-3 py-2 rounded-lg text-mission-muted hover:text-mission-text hover:bg-mission-border/30 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <GlobalSearch compact className="max-w-2xl" />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <DashboardStats />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <ActivityFeed limit={50} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <CalendarView compact />

            {/* Quick Actions */}
            <div className="bg-mission-surface rounded-lg border border-mission-border p-4">
              <h3 className="font-semibold text-mission-text mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-mission-accent text-mission-bg rounded-lg font-medium hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2">
                  <span>Log Activity</span>
                </button>
                <Link
                  href="/calendar"
                  className="w-full px-4 py-2 bg-mission-border/30 text-mission-text rounded-lg font-medium hover:bg-mission-border/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Task</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}