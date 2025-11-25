import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface MenuListSkeletonProps {
  count?: number;
}

export const MenuListSkeleton: React.FC<MenuListSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-700 rounded-xl border border-gray-200/80 dark:border-gray-600/50 overflow-hidden"
        >
          {/* Card header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Card content */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          {/* Card footer */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800 flex justify-end gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
