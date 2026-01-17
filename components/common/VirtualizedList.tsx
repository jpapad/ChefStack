import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 80,
  overscan = 5,
  className = '',
  itemClassName = '',
  getItemKey
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = getItemKey 
            ? getItemKey(item, virtualItem.index)
            : virtualItem.index;

          return (
            <div
              key={key}
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Grid virtualization for card layouts
interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columnCount: number;
  rowHeight?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columnCount,
  rowHeight = 200,
  gap = 16,
  overscan = 2,
  className = '',
  getItemKey
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowCount = Math.ceil(items.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + gap,
    overscan
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const endIndex = Math.min(startIndex + columnCount, items.length);
          const rowItems = items.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  gap: `${gap}px`,
                  height: `${rowHeight}px`
                }}
              >
                {rowItems.map((item, colIndex) => {
                  const itemIndex = startIndex + colIndex;
                  const key = getItemKey 
                    ? getItemKey(item, itemIndex)
                    : itemIndex;

                  return (
                    <div key={key}>
                      {renderItem(item, itemIndex)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for easy virtualization setup
export function useListVirtualization<T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>,
  estimateSize = 80,
  overscan = 5
) {
  return useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan
  });
}
