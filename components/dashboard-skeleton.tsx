"use client";
import { GlobalLoader } from "./global-loader";

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

export function StatCardSkeleton() {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 space-y-3 ${shimmer}`}>
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="h-7 w-16 bg-muted rounded animate-pulse" />
      <div className="h-2 w-28 bg-muted rounded animate-pulse" />
    </div>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${shimmer}`}>
      <div className="h-4 w-36 bg-muted rounded animate-pulse mb-4" />
      <div style={{ height }} className="flex items-end justify-between gap-2 px-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-muted rounded-t-md animate-pulse"
            style={{ height: `${30 + Math.random() * 50}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${shimmer}`}>
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-border last:border-0 flex items-center gap-4">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            <div className="h-2 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none gap-4">
        <GlobalLoader size="xl" />
        <p className="text-sm font-semibold text-primary animate-pulse bg-white/80 px-4 py-1.5 rounded-full shadow-sm backdrop-blur-sm">Loading dashboard stats...</p>
      </div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table skeleton */}
      <TableRowSkeleton rows={3} />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-2xl">
        <GlobalLoader size="xl" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse mt-4">
          Loading dashboard data...
        </p>
      </div>
    </div>
  );
}

export function ApiLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <GlobalLoader size="md" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
