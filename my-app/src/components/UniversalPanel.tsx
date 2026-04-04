import { useRef, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { VirtualizedGrid } from './VirtualizedGrid';
import { GlobalLoader } from './ui/global-loader';

// ── Smart search helper ──────────────────────────────────────────────────────
function filterAndSortItems<T>(
  items: T[],
  query: string,
  getLabel: (item: T) => string
): T[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  return items
    .filter((item) => getLabel(item).toLowerCase().includes(lowerQuery))
    .sort((a, b) => {
      const labelA = getLabel(a).toLowerCase();
      const labelB = getLabel(b).toLowerCase();
      const startsWithA = labelA.startsWith(lowerQuery);
      const startsWithB = labelB.startsWith(lowerQuery);
      if (startsWithA && !startsWithB) return -1;
      if (!startsWithA && startsWithB) return 1;
      return 0;
    });
}

// ── Props ────────────────────────────────────────────────────────────────────
export interface UniversalPanelProps<T> {
  items: T[];
  columnCount: number;
  width: number;
  height?: number | string;
  itemHeight?: number;
  itemWidth?: number | string;

  /** e.g. "Elements" — used for dynamic loading text and empty state */
  panelName: string;
  /** Lucide icon component shown in the empty-state illustration */
  panelIcon: React.ComponentType<{ size?: number; className?: string }>;

  searchQuery: string;
  onSearchChange: (q: string) => void;
  placeholder?: string;
  getItemLabel: (item: T) => string;

  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;

  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;

  subtitle?: string;
  isDark?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────
export function UniversalPanel<T>({
  items,
  columnCount,
  width,
  height = '100%',
  itemHeight,
  itemWidth,
  panelName,
  panelIcon: PanelIcon,
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  getItemLabel,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  renderItem,
  getItemId,
  subtitle,
  isDark = false,
}: UniversalPanelProps<T>) {
  // ── Scroll reset ───────────────────────────────────────────────────────────
  const resetScrollRef = useRef<(() => void) | undefined>(undefined);

  // ── Debounced search ───────────────────────────────────────────────────────
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery !== debouncedQuery) setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset scroll when settled query changes
  useEffect(() => {
    if (resetScrollRef.current) resetScrollRef.current();
  }, [debouncedQuery]);

  // ── Smart filtering ────────────────────────────────────────────────────────
  const filteredItems = filterAndSortItems(items, debouncedQuery, getItemLabel);

  // ── Dynamic text ───────────────────────────────────────────────────────────
  const dynamicLoadingText = `Loading ${panelName.toLowerCase()}...`;
  const hasQuery = debouncedQuery.trim().length > 0;
  const isEmpty = filteredItems.length === 0 && hasQuery && !isLoading && !isSearching;
  const isShowLoading = isLoading;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* ── Search Bar ─────────────────────────────────────────────────────── */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
            isDark
              ? 'bg-[#161625] border-[#2a2d45] focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]/50'
              : 'bg-gray-50 border-gray-200 focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]/50'
          }`}
        >
          {/* Spinner while typing / loading or stable icon otherwise */}
          {isLoading || isSearching ? (
            <GlobalLoader size={16} fullScreen={false} className="flex-shrink-0" />
          ) : (
            <Search size={16} className={`flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          )}

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

        {/* Result count — only after query settles */}
        {!isSearching && hasQuery && !isEmpty && (
          <p className={`text-[11px] mt-1 px-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {filteredItems.length} result{filteredItems.length === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {/* ── Subtitle (hidden when searching) ───────────────────────────────── */}
      {subtitle && !hasQuery && (
        <span className={`text-sm font-semibold px-4 pb-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {subtitle}
        </span>
      )}

      {/* ── Loading State / Empty State / Grid ───────────────────────────────── */}
      {isShowLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] select-none">
          {/* GlobalLoader - 64px, no fullScreen */}
          <GlobalLoader size={64} fullScreen={false} className="mb-4" />
          
          {/* Smart loading text - shrinks if too long */}
          <p 
            className={`font-semibold whitespace-nowrap px-4 text-center ${
              dynamicLoadingText.length > 25 
                ? 'text-base'  // Long text = smaller
                : 'text-lg'    // Normal text = default size
            } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {dynamicLoadingText}
          </p>
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] select-none">
          <PanelIcon
            size={64}
            className={`mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}
          />
          <p className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No results found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Try a different search term
          </p>
        </div>
      ) : (
        /* ── Grid ──────────────────────────────────────────────────────────── */
        <div className="flex-1 min-h-0">
          <VirtualizedGrid
            items={filteredItems}
            columnCount={columnCount}
            width={width}
            height={height}
            itemHeight={itemHeight}
            itemWidth={itemWidth}
            getItemId={getItemId}
            renderItem={renderItem}
            isFetchingNextPage={isFetchingNextPage}
            onScrollEnd={() => {
              if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
                fetchNextPage();
              }
            }}
            onResetScroll={(fn) => { resetScrollRef.current = fn; }}
          />
        </div>
      )}
    </div>
  );
}
