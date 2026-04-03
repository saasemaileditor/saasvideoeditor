import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export interface VirtualizedGridProps<T> {
  items: T[];
  columnCount: number;
  width: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
}

export function VirtualizedGrid<T>({
  items,
  columnCount,
  width,
  height,
  renderItem,
  getItemId,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(items.length / columnCount);
  
  // Grid cell size requirements:
  // 110px width × 140px height (expanded - 4 cols)
  // 130px width × 140px height (collapsed - 2 cols)
  // Gap: 16px
  const itemHeight = 140;
  const gap = 16;
  const rowHeight = itemHeight + gap; 
  const itemWidth = columnCount === 4 ? 110 : 130;

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
      className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
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
              }}
            >
              {rowItems.map((item, localIndex) => {
                const index = startIndex + localIndex;
                return (
                  <div
                    key={getItemId(item)}
                    style={{
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
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
    </div>
  );
}
