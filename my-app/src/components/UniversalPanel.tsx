import { useRef, useEffect, useState } from 'react';
import { Search, X, Maximize2, Minimize2, ChevronDown, Rows2, LayoutGrid, Grid3X3 } from 'lucide-react';
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

  // Header controls
  title?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  
  // Expand/collapse
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showExpandButton?: boolean;
  canExpand?: boolean;
  
  // Layout dropdown
  layout?: 'list' | 'grid' | 'small-grid';
  onLayoutChange?: (layout: 'list' | 'grid' | 'small-grid') => void;
  showLayoutDropdown?: boolean;
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
  title,
  onClose,
  showCloseButton = true,
  isExpanded = true,
  onToggleExpand,
  showExpandButton = true,
  canExpand = true,
  layout = 'list',
  onLayoutChange,
  showLayoutDropdown = false,
}: UniversalPanelProps<T>) {
  // ── Scroll reset ───────────────────────────────────────────────────────────
  const resetScrollRef = useRef<(() => void) | undefined>(undefined);

  // ── Debounced search ───────────────────────────────────────────────────────
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isLayoutDropdownOpen, setIsLayoutDropdownOpen] = useState(false);

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

      {/* ── Header Controls ──────────────────────────────────────────────────── */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <span className={`font-bold text-[16px] ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </span>
          <div className="flex items-center gap-1">
            {showLayoutDropdown && onLayoutChange && (
              <div className="relative z-50 mr-1">
                <button
                  onClick={() => setIsLayoutDropdownOpen(!isLayoutDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-sm font-medium cursor-pointer transition-colors ${
                    isDark ? 'border-[#2a2d45] bg-[#1e2235] text-gray-300 hover:bg-[#252840]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {layout === 'list' ? <Rows2 size={16} /> : layout === 'grid' ? <LayoutGrid size={16} /> : <Grid3X3 size={16} />}
                  <ChevronDown size={14} />
                </button>

                {isLayoutDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsLayoutDropdownOpen(false)} />
                    <div className={`absolute top-full right-0 mt-1 p-1 w-32 rounded-lg shadow-xl border z-[120] flex flex-col ${
                      isDark ? 'bg-[#1e2235] border-[#2a2d45]' : 'bg-white border-gray-100'
                    }`}>
                      {[
                        { id: 'list', icon: Rows2, label: 'List' },
                        { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                        { id: 'small-grid', icon: Grid3X3, label: 'Small Grid' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { onLayoutChange(opt.id as any); setIsLayoutDropdownOpen(false); }}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                            layout === opt.id
                              ? isDark ? 'bg-[#4c1d95] text-[#a78bfa]' : 'bg-[#ede9fe] text-[#7c3aed]'
                              : isDark ? 'text-gray-300 hover:bg-[#252840]' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <opt.icon size={14} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {canExpand && showExpandButton && onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title={isExpanded ? 'Collapse panel' : 'Expand panel'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Close panel"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

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
          {/* GlobalLoader - same position as empty state icon */}
          <GlobalLoader size={64} fullScreen={false} className="mb-4" />
          
          {/* Loading text - same style as "No results found" */}
          <p className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {dynamicLoadingText}
          </p>
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] select-none">
          {/* Icon - same mb-4 as loader */}
          <PanelIcon
            size={64}
            className={`mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}
          />
          {/* Main text - same style as loading text */}
          <p className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No results found
          </p>
          {/* Sub text - NO margin top, directly below */}
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
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
