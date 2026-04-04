import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useRef, useEffect } from 'react';
import { GlobalLoader } from './ui/global-loader';

export interface VirtualizedGridProps<T> {
  items: T[];
  columnCount: number;
  width: number;
  height: number | string;
  itemHeight?: number;
  itemWidth?: number | string;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  // Phase 1: throttled infinite scroll
  onScrollEnd?: () => void;
  isFetchingNextPage?: boolean;
  // Phase 3: expose scroll-reset to parent
  onResetScroll?: (resetFn: () => void) => void;
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
  onResetScroll,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Phase 1: ref-based fetch guard — prevents re-firing while already fetching
  const isFetchingRef = useRef(false);

  // Phase 3: expose resetScroll to parent via callback
  useEffect(() => {
    if (onResetScroll) {
      onResetScroll(() => {
        if (parentRef.current) {
          parentRef.current.scrollTop = 0;
        }
        // also reset the throttle guard so the next page can load immediately
        isFetchingRef.current = false;
      });
    }
  }, [onResetScroll]);

  const rowCount = Math.ceil(items.length / columnCount);

  // Gap: 12px
  const gap = 12;
  const resolvedItemHeight = itemHeight ?? 140;
  const rowHeight = resolvedItemHeight + gap;

  // Symmetric padding + reserve space for scrollbar so no horizontal overflow
  const H_PADDING = 16; // 16px each side = 32px total
  const SCROLLBAR_WIDTH = 14; // reserve for vertical scrollbar
  const totalGapWidth = (columnCount - 1) * gap;
  const availableWidth = width - totalGapWidth - H_PADDING * 2 - SCROLLBAR_WIDTH;
  const calculatedItemWidth = Math.max(40, Math.floor(availableWidth / columnCount));
  // Only fall back to caller-supplied itemWidth if it is a number; ignore "100%" strings
  const resolvedItemWidth =
    typeof itemWidth === 'number' ? itemWidth : calculatedItemWidth;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  // Phase 1: throttled scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onScrollEnd || isFetchingRef.current || isFetchingNextPage) return;
    const target = e.target as HTMLDivElement;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) {
      isFetchingRef.current = true;
      onScrollEnd();
      // reset guard after 200ms — lets normal scrolling continue without re-firing
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 200);
    }
  };

  return (
    <div
      ref={parentRef}
      style={{ height, width, overflowY: 'auto', overflowX: 'hidden' }}
      className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent dark:scrollbar-thumb-gray-600"
      onScroll={handleScroll}
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
                padding: `0 ${H_PADDING}px`,
                boxSizing: 'border-box',
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

      {/* Bottom infinite-scroll loader */}
      {isFetchingNextPage && (
        <div className="py-4 text-center text-sm font-medium text-gray-400 flex items-center justify-center gap-2">
          <GlobalLoader size={16} fullScreen={false} />
          Loading more...
        </div>
      )}
    </div>
  );
}
