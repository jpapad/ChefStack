import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface InventoryListSkeletonProps {
  count?: number;
}

export const InventoryListSkeleton: React.FC<InventoryListSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-gray-200/80 dark:border-gray-600/50 flex items-center justify-between gap-4"
        >
          {/* Left: Item info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon placeholder */}
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            
            {/* Text content */}
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Right: Quantity and actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Quantity badge */}
            <Skeleton className="h-8 w-20 rounded-full" />
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
