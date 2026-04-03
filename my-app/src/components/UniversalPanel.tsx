import { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { VirtualizedGrid } from './VirtualizedGrid';

export interface UniversalPanelProps<T> {
  /** Data to render */
  items: T[];
  /** Number of columns in the grid */
  columnCount: number;
  /** Full pixel width of the panel (controls grid + scrollbar position) */
  width: number;
  /** Height passed through to VirtualizedGrid (default: '100%') */
  height?: number | string;
  /** Optional fixed item height (VirtualizedGrid default: 140px) */
  itemHeight?: number;
  /** Optional fixed item width — pass '100%' for full-width single-column layouts */
  itemWidth?: number | string;

  /** Search bar */
  searchQuery: string;
  onSearchChange: (q: string) => void;
  placeholder?: string;

  /** Infinite-scroll / loading state */
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;

  /** Render helpers */
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;

  /** Optional subheading beneath the search bar */
  subtitle?: string;

  /** Dark-mode flag — passed down from parent */
  isDark?: boolean;

  /** Loading text shown in centre spinner (default: 'Loading...') */
  loadingText?: string;
}

/**
 * UniversalPanel
 *
 * A single, self-contained panel body used by ALL sidebar tabs:
 * Elements, Templates, Animations, and any future panels.
 *
 * Features:
 *  • Search input with animated focus ring
 *  • VirtualizedGrid with infinite-scroll throttle guard
 *  • Initial loading spinner
 *  • Scroll reset when search query changes
 *  • Scrollbar flush to right edge
 */
export function UniversalPanel<T>({
  items,
  columnCount,
  width,
  height = '100%',
  itemHeight,
  itemWidth,
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  renderItem,
  getItemId,
  subtitle,
  isDark = false,
  loadingText = 'Loading...',
}: UniversalPanelProps<T>) {
  // Scroll-reset ref — holds the reset function exposed by VirtualizedGrid
  const resetScrollRef = useRef<(() => void) | undefined>(undefined);

  // Whenever searchQuery changes, jump the list back to the top
  useEffect(() => {
    if (resetScrollRef.current) {
      resetScrollRef.current();
    }
  }, [searchQuery]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Search Bar ─────────────────────────────────────────── */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
            isDark
              ? 'bg-[#161625] border-[#2a2d45] focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]/50'
              : 'bg-gray-50 border-gray-200 focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]/50'
          }`}
        >
          <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`flex-1 bg-transparent border-none outline-none text-sm font-medium w-full ${
              isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      {/* ── Optional subtitle ──────────────────────────────────── */}
      {subtitle && (
        <span
          className={`text-sm font-semibold px-4 pb-2 flex-shrink-0 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}
        >
          {subtitle}
        </span>
      )}

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <VirtualizedGrid
          items={items}
          columnCount={columnCount}
          width={width}
          height={height}
          itemHeight={itemHeight}
          itemWidth={itemWidth}
          getItemId={getItemId}
          renderItem={renderItem}
          isLoading={isLoading}
          loadingText={loadingText}
          isFetchingNextPage={isFetchingNextPage}
          onScrollEnd={() => {
            if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
              fetchNextPage();
            }
          }}
          onResetScroll={(fn) => {
            resetScrollRef.current = fn;
          }}
        />
      </div>
    </div>
  );
}
