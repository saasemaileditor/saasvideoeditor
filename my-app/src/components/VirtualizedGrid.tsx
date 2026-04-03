import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export interface VirtualizedGridProps<T> {
  items: T[];
  columnCount: number;
  width: number;
  height: number | string;
  itemHeight?: number;
  itemWidth?: number | string;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  onScrollEnd?: () => void;
  isFetchingNextPage?: boolean;
}

export function VirtualizedGrid<T>({
  items,
  columnCount,
  width,
  height,
  itemHeight,
  itemWidth,
  renderItem,
  getItemId,
  onScrollEnd,
  isFetchingNextPage,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(items.length / columnCount);
  
  // Grid cell size requirements:
  // 110px width × 140px height (expanded - 4 cols)
  // 130px width × 140px height (collapsed - 2 cols)
  // Gap: 16px
  const gap = 16;
  const resolvedItemHeight = itemHeight ?? 140;
  const rowHeight = resolvedItemHeight + gap;
  
  // Calculate item width accounting for gaps
  const totalGapWidth = (columnCount - 1) * gap;
  const availableWidth = width - totalGapWidth - 24; // 24px for padding (px-3 = 12px each side)
  const calculatedItemWidth = Math.floor(availableWidth / columnCount);
  const resolvedItemWidth = itemWidth !== undefined ? itemWidth : calculatedItemWidth;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height,
        width,
        overflow: 'auto',
      }}
      className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent dark:scrollbar-thumb-gray-600"
      onScroll={(e) => {
        if (onScrollEnd) {
          const target = e.target as HTMLDivElement;
          // check if we are near the bottom (e.g. within 100px)
          if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) {
            onScrollEnd();
          }
        }
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const rowItems = items.slice(startIndex, startIndex + columnCount);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                gap: `${gap}px`,
                padding: '0 12px', // px-3 equivalent
              }}
            >
              {rowItems.map((item, localIndex) => {
                const index = startIndex + localIndex;
                return (
                  <div
                    key={getItemId(item)}
                    style={{
                      width: typeof resolvedItemWidth === 'number' ? `${resolvedItemWidth}px` : resolvedItemWidth,
                      height: `${resolvedItemHeight}px`,
                      flexShrink: 0,
                    }}
                  >
                    {renderItem(item, index)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {isFetchingNextPage && (
        <div className="py-4 text-center text-sm font-medium text-gray-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
          Loading more...
        </div>
      )}
    </div>
  );
}

