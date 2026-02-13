"use client";

import { CalendarView } from "@/components/CalendarView";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LayoutDashboard, Calendar, Search } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
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
            <div className="flex items-center gap-4">
              <GlobalSearch compact className="w-64" />
              <nav className="flex items-center gap-1">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-lg text-mission-muted hover:text-mission-text hover:bg-mission-border/30 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/calendar"
                  className="px-3 py-2 rounded-lg text-mission-text bg-mission-border/30 font-medium flex items-center gap-2"
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CalendarView />
      </main>
    </div>
  );
}