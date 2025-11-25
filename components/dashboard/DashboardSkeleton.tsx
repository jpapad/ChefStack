import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-gray-200/80 dark:border-gray-600/50"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-gray-200/80 dark:border-gray-600/50">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>

        {/* Chart 2 */}
        <div className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-gray-200/80 dark:border-gray-600/50">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Recent activity list */}
      <div className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-gray-200/80 dark:border-gray-600/50">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
