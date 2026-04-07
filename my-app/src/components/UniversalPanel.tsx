import { useRef, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { VirtualizedGrid } from './VirtualizedGrid';
import { GlobalLoader } from './ui/global-loader';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  width: number;
  height?: number | string;
  itemHeight?: number;
  itemWidth?: number | string;
  loadOnce?: boolean;  // Prevent auto-loading more than once per scroll


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
  isFetchingPreviousPage?: boolean;
  hasPreviousPage?: boolean;
  fetchPreviousPage?: () => void;
  
  totalCount?: number;
  pageSize?: number;
  firstPageParam?: number;

  renderItem: (item: T, index: number, listeners?: any, attributes?: any) => React.ReactNode;
  getItemId: (item: T) => string;

  isDark?: boolean;

  // Header controls
  title?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  
  showSearch?: boolean;
  showSubtitle?: boolean;
  customHeaderContent?: React.ReactNode;
  columnCount?: number;
  onReorder?: (oldIndex: number, newIndex: number) => void;
}

// ── Sortable Item Helper ──────────────────────────────────────────────────
function SortableItem<T>({ 
  id, 
  item, 
  index, 
  isDark,
  renderItem 
}: { 
  id: string, 
  item: T, 
  index: number; 
  isDark: boolean;
  renderItem: (item: T, index: number, listeners?: any, attributes?: any) => React.ReactNode 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const isSortable = id !== 'canvas-background';

  return (
    <div ref={setNodeRef} style={style}>
      {isDragging ? (
        <div 
          className={`mx-2 mb-1.5 rounded-xl border-2 border-dashed ${isDark ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-100 border-gray-200'}`}
          style={{ height: '52px' }} 
        />
      ) : (
        renderItem(item, index, isSortable ? listeners : undefined, isSortable ? attributes : undefined)
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export function UniversalPanel<T>({
  items,
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
  isFetchingPreviousPage = false,
  hasPreviousPage = false,
  fetchPreviousPage,
  totalCount,
  pageSize,
  firstPageParam = 0,
  renderItem,
  getItemId,
  isDark = false,
  title,
  onClose,
  showCloseButton = true,
  loadOnce = false,
  showSearch = true,
  showSubtitle = true,
  customHeaderContent = null,
  columnCount = 3,
  onReorder,
}: UniversalPanelProps<T>) {
  // ── DND Sensors ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (onReorder && over && active.id !== over.id) {
        const oldIndex = filteredItems.findIndex(i => getItemId(i) === active.id);
        const newIndex = filteredItems.findIndex(i => getItemId(i) === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            onReorder(oldIndex, newIndex);
        }
    }
  };

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

  // Clear search on unmount
  useEffect(() => {
    return () => {
      onSearchChange('');
    };
  }, [onSearchChange]);

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

      {/* ── Custom Header Content / Search Bar ───────────────────────────────── */}
      <div className="px-4 pb-2 flex-shrink-0">
        {customHeaderContent}
        
        {showSearch && (
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
        )}
      </div>

      {/* ── Subtitle (hidden when searching) ───────────────────────────────── */}
      {showSubtitle && !hasQuery && (
        <span className={`text-sm font-semibold px-4 pb-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Browse categories
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
          {onReorder ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={filteredItems.filter(i => getItemId(i) !== 'canvas-background').map(getItemId)} 
                strategy={verticalListSortingStrategy}
              >
                <VirtualizedGrid
                  items={filteredItems}
                  columnCount={columnCount}
                  width={width}
                  height={height}
                  itemHeight={itemHeight}
                  itemWidth={itemWidth}
                  getItemId={getItemId}
                  renderItem={(item, index) => (
                    <SortableItem 
                      id={getItemId(item)}
                      item={item}
                      index={index}
                      isDark={isDark}
                      renderItem={renderItem}
                    />
                  )}
                  isFetchingNextPage={isFetchingNextPage}
                  isFetchingPreviousPage={isFetchingPreviousPage}
                  loadOnce={loadOnce}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  firstPageParam={firstPageParam}
                  onScrollEnd={() => {
                    if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
                      fetchNextPage();
                    }
                  }}
                  onScrollStart={() => {
                    if (hasPreviousPage && !isFetchingPreviousPage && fetchPreviousPage) {
                      fetchPreviousPage();
                    }
                  }}
                  onResetScroll={(fn) => { resetScrollRef.current = fn; }}
                />
              </SortableContext>

              <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }), duration: 200 }}>
                {activeId ? (
                    <div style={{ width: itemWidth || width }}>
                        {renderItem(filteredItems.find(i => getItemId(i) === activeId)!, -1)}
                    </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
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
              isFetchingPreviousPage={isFetchingPreviousPage}
              loadOnce={loadOnce}
              totalCount={totalCount}
              pageSize={pageSize}
              firstPageParam={firstPageParam}
              onScrollEnd={() => {
                if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
                  fetchNextPage();
                }
              }}
              onScrollStart={() => {
                if (hasPreviousPage && !isFetchingPreviousPage && fetchPreviousPage) {
                  fetchPreviousPage();
                }
              }}
              onResetScroll={(fn) => { resetScrollRef.current = fn; }}
            />
          )}
        </div>
      )}
    </div>
  );
}
