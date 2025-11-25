import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface HaccpLogListSkeletonProps {
  count?: number;
}

export const HaccpLogListSkeleton: React.FC<HaccpLogListSkeletonProps> = ({ count = 10 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-gray-200/80 dark:border-gray-600/50"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Log info */}
            <div className="flex items-center gap-4 flex-1">
              {/* Status icon */}
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              
              {/* Log details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
