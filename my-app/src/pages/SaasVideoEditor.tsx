import { useState, useEffect, useRef, useCallback, memo, Suspense } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { CanvaBoundingBox } from '../components/CanvaBoundingBox';
import { UniversalPanel } from '../components/UniversalPanel';
import { Timeline } from '../components/Timeline';
import { useEditorStore, useUIStore, getHistoryControls } from '../store/useEditorStore';
import { PANEL_ELEMENTS, getElementComponent, ELEMENT_CATEGORIES } from '../components/elements';
import type { PanelElementDef } from '../components/elements';

import {
    DndContext,
    DragOverlay,
    useDroppable,
    useDraggable,
    useSensor,
    useSensors,
    PointerSensor,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    Undo2, Redo2, Play, Download,
    Layers, Video, Sparkles, LayoutTemplate,
    X, Settings as SettingsIcon, Sun, Moon, Monitor, Type, Square,
    Move, Smartphone, ChevronDown, ArrowLeft, GripVertical, MoreVertical,
    Box, PieChart, AppWindow, Smile, Triangle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

const TABS = [
    { id: 'Elements', icon: Layers, label: 'Elements' },
    { id: 'Media', icon: Video, label: 'Media' },
    { id: 'Position', icon: Move, label: 'Position' },
    { id: 'Text', icon: Type, label: 'Text' },
    { id: 'Templates', icon: LayoutTemplate, label: 'Templates' },
];

const ANIMATION_PRESETS = [
    {
        id: 'fade',
        label: 'Fade In',
        color: '#7c3aed',
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
    },
    {
        id: 'slideLeft',
        label: 'Slide Left',
        color: '#2563eb',
        initial: { opacity: 0, x: -40 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4 },
    },
    {
        id: 'slideRight',
        label: 'Slide Right',
        color: '#0891b2',
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4 },
    },
    {
        id: 'slideUp',
        label: 'Slide Up',
        color: '#059669',
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
    },
    {
        id: 'slideDown',
        label: 'Slide Down',
        color: '#d97706',
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
    },
    {
        id: 'scaleUp',
        label: 'Scale Up',
        color: '#db2777',
        initial: { opacity: 0, scale: 0.3 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4 },
    },
    {
        id: 'scaleDown',
        label: 'Scale Down',
        color: '#7c3aed',
        initial: { opacity: 0, scale: 1.6 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4 },
    },
    {
        id: 'bounce',
        label: 'Bounce',
        color: '#16a34a',
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
    },
    {
        id: 'spring',
        label: 'Spring',
        color: '#9333ea',
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
    {
        id: 'rotate',
        label: 'Rotate',
        color: '#ea580c',
        initial: { opacity: 0, rotate: -180 },
        animate: { opacity: 1, rotate: 0 },
        transition: { duration: 0.5 },
    },
    {
        id: 'flip',
        label: 'Flip',
        color: '#0284c7',
        initial: { opacity: 0, rotateX: 90 },
        animate: { opacity: 1, rotateX: 0 },
        transition: { duration: 0.5 },
    },
    {
        id: 'zoom',
        label: 'Zoom',
        color: '#be185d',
        initial: { opacity: 0, scale: 2 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4, ease: 'easeOut' as const },
    },
];

const AnimationCard = ({ preset, isDark, isSelected, onSelect }: {
    preset: typeof ANIMATION_PRESETS[0];
    isDark: boolean;
    isSelected: boolean;
    onSelect: () => void;
}) => {
    const [key, setKey] = useState(0);
    const replay = () => setKey(k => k + 1);

    return (
        <button
            onClick={() => { onSelect(); replay(); }}
            onMouseEnter={replay}
            className={`relative w-full h-full flex border transition-all cursor-pointer flex-col items-center justify-center p-3 gap-2 text-center rounded-xl ${isSelected
                    ? isDark
                        ? 'border-[#7c3aed] bg-[#2d1f5e]'
                        : 'border-[#7c3aed] bg-[#ede9fe]'
                    : isDark
                        ? 'border-[#2a2d45] bg-[#161625] hover:border-[#7c3aed]/50 hover:bg-[#1e2235]'
                        : 'border-gray-100 bg-gray-50 hover:border-[#7c3aed]/40 hover:bg-white'
                }`}
        >
            {/* Preview Box */}
            <div
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: preset.color + '22' }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={key}
                        initial={preset.initial}
                        animate={preset.animate}
                        transition={preset.transition}
                        className="w-5 h-5 rounded-md"
                        style={{ backgroundColor: preset.color }}
                    />
                </AnimatePresence>
            </div>
            {/* Label */}
            <span className={`text-xs font-semibold ${isSelected
                ? 'text-[#7c3aed]'
                : isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                {preset.label}
            </span>
            {isSelected && (
                <span className="absolute top-1.5 right-1.5 text-[10px] font-bold text-[#7c3aed] uppercase tracking-wide">
                    ✓
                </span>
            )}
        </button>
    );
};

// Build the flat elements list for the panel from the registry
const UI_ELEMENTS: PanelElementDef[] = PANEL_ELEMENTS;

export const useInfiniteElements = (searchQuery: string, pageSize: number = 20, selectedCategory: string | null = null) => {
    return useInfiniteQuery({
        queryKey: ['elements', searchQuery, selectedCategory],
        queryFn: async ({ pageParam = 0 }) => {
            // Mock network delay
            await new Promise((resolve) => setTimeout(resolve, 300));

            let filteredElements = UI_ELEMENTS;
            if (selectedCategory) {
               filteredElements = filteredElements.filter(el => el.category === selectedCategory);
            }

            // Server-side filtering mock
            filteredElements = searchQuery
                ? filteredElements.filter((el) =>
                      el.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      el.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : filteredElements;

            const start = pageParam * pageSize;
            const end = start + pageSize;
            const data = filteredElements.slice(start, end);

            return {
                data,
                currentPage: pageParam,
                nextPage: end < filteredElements.length ? pageParam + 1 : undefined,
                prevPage: pageParam > 0 ? pageParam - 1 : undefined
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        getPreviousPageParam: (firstPage) => firstPage.prevPage,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        maxPages: 10,
        refetchOnWindowFocus: false,
    });
};

const TEMPLATES: { id: string; icon: LucideIcon; label: string }[] = [
    { id: 'template-marketing', icon: AppWindow, label: 'Marketing Promo' },
    { id: 'template-tutorial', icon: Video, label: 'Tutorial' },
    { id: 'template-gaming', icon: Box, label: 'Gaming Intro' },
    { id: 'template-vlog', icon: Smartphone, label: 'Vlog Setup' },
    { id: 'template-corporate', icon: LayoutTemplate, label: 'Corporate' },
    { id: 'template-social', icon: Smile, label: 'Social Media' },
    { id: 'template-education', icon: PieChart, label: 'Education' },
    { id: 'template-abstract', icon: Triangle, label: 'Abstract' },
];

export const useTemplates = (searchQuery: string) => {
    return useInfiniteQuery({
        queryKey: ['templates', searchQuery],
        queryFn: async () => {
            // Simulate network delay for loading state
            await new Promise((resolve) => setTimeout(resolve, 300));
            
            // Filter templates based on search query
            const filtered = searchQuery
                ? TEMPLATES.filter((t) => 
                    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : TEMPLATES;
            
            return {
                data: filtered,
                nextPage: undefined, // No pagination for templates
            };
        },
        initialPageParam: 0,
        getNextPageParam: () => undefined,
    });
};

const MEDIA_STOCK = [
    { id: 'media-1', label: 'Beach Sunset', type: 'video', url: 'https://cdn.pixabay.com/video/2016/09/13/4728-179738301_tiny.mp4', duration: '15s', thumbnail: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&h=120' },
    { id: 'media-2', label: 'Mountain Hike', type: 'video', url: 'https://cdn.pixabay.com/video/2021/04/12/70796-538356983_tiny.mp4', duration: '12s', thumbnail: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&h=120' },
    { id: 'media-3', label: 'Coffee Brewing', type: 'video', url: 'https://cdn.pixabay.com/video/2020/07/22/45131-441604547_tiny.mp4', duration: '8s', thumbnail: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&h=120' },
    { id: 'media-4', label: 'City Night', type: 'video', url: 'https://cdn.pixabay.com/video/2016/10/18/5888-186981145_tiny.mp4', duration: '10s', thumbnail: 'https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg?auto=compress&cs=tinysrgb&h=120' },
    { id: 'media-5', label: 'Forest Stream', type: 'video', url: 'https://cdn.pixabay.com/video/2021/09/06/87588-601726055_tiny.mp4', duration: '20s', thumbnail: 'https://images.pexels.com/photos/2280954/pexels-photo-2280954.jpeg?auto=compress&cs=tinysrgb&h=120' },
    { id: 'media-6', label: 'Neon City', type: 'video', url: 'https://cdn.pixabay.com/video/2020/01/14/31154-386047378_tiny.mp4', duration: '14s', thumbnail: 'https://images.pexels.com/photos/3166786/pexels-photo-3166786.jpeg?auto=compress&cs=tinysrgb&h=120' },
    { id: 'media-7', label: 'Desert Dunes', type: 'video', url: 'https://cdn.pixabay.com/video/2017/04/24/8910-213941423_tiny.mp4', duration: '18s', thumbnail: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&h=120' },
    { id: 'media-8', label: 'Cyberpunk Girl', type: 'video', url: 'https://cdn.pixabay.com/video/2020/12/29/60450-496660636_tiny.mp4', duration: '10s', thumbnail: 'https://images.pexels.com/photos/2773498/pexels-photo-2773498.jpeg?auto=compress&cs=tinysrgb&h=120' },
];

export const useMedia = (searchQuery: string) => {
    return useInfiniteQuery({
        queryKey: ['media', searchQuery],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const filtered = searchQuery
                ? MEDIA_STOCK.filter((m) => 
                    m.label.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : MEDIA_STOCK;
            return { data: filtered, nextPage: undefined };
        },
        initialPageParam: 0,
        getNextPageParam: () => undefined,
    });
};

const POSITION_PRESETS = [
    { id: 'pos-tl', label: 'Top Left', x: 10, y: 10, icon: Move },
    { id: 'pos-tc', label: 'Top Center', x: 50, y: 10, icon: Move },
    { id: 'pos-tr', label: 'Top Right', x: 90, y: 10, icon: Move },
    { id: 'pos-cl', label: 'Center Left', x: 10, y: 50, icon: Move },
    { id: 'pos-center', label: 'Perfect Center', x: 50, y: 50, icon: Move },
    { id: 'pos-cr', label: 'Center Right', x: 90, y: 50, icon: Move },
    { id: 'pos-bl', label: 'Bottom Left', x: 10, y: 90, icon: Move },
    { id: 'pos-bc', label: 'Bottom Center', x: 50, y: 90, icon: Move },
    { id: 'pos-br', label: 'Bottom Right', x: 90, y: 90, icon: Move },
];

export const usePositions = (searchQuery: string) => {
    return useInfiniteQuery({
        queryKey: ['positions', searchQuery],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const filtered = searchQuery
                ? POSITION_PRESETS.filter((p) => 
                    p.label.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : POSITION_PRESETS;
            return { data: filtered, nextPage: undefined };
        },
        initialPageParam: 0,
        getNextPageParam: () => undefined,
    });
};

export const useAnimations = (searchQuery: string) => {
    return useInfiniteQuery({
        queryKey: ['animations', searchQuery],
        queryFn: async () => {
            // Simulate network delay for loading state
            await new Promise((resolve) => setTimeout(resolve, 300));
            
            // Filter animations based on search query
            // @ts-ignore
            const filtered = searchQuery
                // @ts-ignore
                ? ANIMATION_PRESETS.filter((a) => 
                    a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                // @ts-ignore
                : ANIMATION_PRESETS;
            
            return {
                data: filtered,
                nextPage: undefined, // No pagination for animations
            };
        },
        initialPageParam: 0,
        getNextPageParam: () => undefined,
    });
};

/* ─── Draggable element sidebar card ─── */
const DraggableElementCard = ({ element, isDark }: { element: PanelElementDef, isDark: boolean }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${element.type}`,
        data: { type: element.type, label: element.label, boundingSize: element.boundingSize },
    });

    const PreviewComponent = getElementComponent(element.type) as React.ElementType<any>;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`relative w-full h-[120px] hover:cursor-grab group touch-none ${isDragging ? 'opacity-40' : ''}`}
        >
            <div className={`relative w-full h-full flex flex-col items-center justify-between p-3 border rounded-xl z-10 transition-all duration-300 overflow-hidden ${isDark 
                ? 'bg-[#161625] border-[#2a2d45] group-hover:border-[#7c3aed] group-hover:bg-[#2d1f5e]' 
                : 'bg-white border-gray-200 shadow-sm group-hover:border-[#7c3aed] group-hover:bg-[#ede9fe] group-hover:shadow-md'}`}>
                {/* Preview: actual component or fallback emoji */}
                <div className="flex-1 w-full flex items-center justify-center select-none pointer-events-none" style={{transform: "scale(0.55)", transformOrigin: "center center"}}>
                    {PreviewComponent ? (
                        <Suspense fallback={<div className="text-4xl">{element.previewEmoji ?? '📦'}</div>}>
                            {/* @ts-ignore */}
                            <PreviewComponent>Preview</PreviewComponent>
                        </Suspense>
                    ) : (
                        <div className="text-4xl leading-none">
                            {element.previewEmoji ?? '📦'}
                        </div>
                    )}
                </div>
                
                <span className={`text-[11px] mt-1 font-semibold text-center leading-tight transition-colors line-clamp-2 ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-[#7c3aed]'}`}>
                    {element.label}
                </span>
            </div>
        </div>
    );
};

/* ─── Draggable sidebar card (uses @dnd-kit useDraggable) ─── */
const DraggableCard = ({ elementId, icon: Icon, label, isDark }: {
    elementId: string;
    icon: LucideIcon;
    label: string;
    isDark: boolean;
}) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${elementId}`,
        data: { type: elementId },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`relative w-full h-full max-h-[140px] hover:cursor-grab group touch-none ${isDragging ? 'opacity-40' : ''
                }`}
        >
            {/* The Front Card */}
            <div className={`relative w-full h-full flex flex-col items-center justify-center gap-2.5 border rounded-xl z-10 transition-all duration-300 ${isDark
                ? 'bg-[#161625] border-[#2a2d45] group-hover:border-[#7c3aed] group-hover:bg-[#2d1f5e]'
                : 'bg-white border-gray-200 shadow-sm group-hover:border-[#7c3aed] group-hover:bg-[#ede9fe] group-hover:shadow-md'
                }`}>
                <Icon size={24} className={`transition-colors ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-[#7c3aed]'}`} />
                {label && (
                    <span className={`text-xs font-semibold transition-colors ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-[#7c3aed]'}`}>{label}</span>
                )}
            </div>
        </div>
    );
};

/* ─── Drag overlay preview card ─── */
const DragOverlayCard = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <div className="w-[80px] h-[80px] rounded-xl bg-[#7c3aed] flex flex-col items-center justify-center gap-1 shadow-2xl opacity-90 pointer-events-none">
        <Icon size={24} className="text-white" />
        <span className="text-[11px] font-semibold text-white">{label}</span>
    </div>
);

/* ─── Canvas drop zone (uses @dnd-kit useDroppable) ─── */
const CanvasDropZone = ({ canvasRef, isDark, setSelectedId, children }: {
    canvasRef: React.RefObject<HTMLDivElement | null>;
    isDark: boolean;
    setSelectedId: (id: string | null) => void;
    children: React.ReactNode;
}) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'canvas-dropzone' });

    // Merge the dnd-kit ref with the existing canvasRef so both systems track the same div
    const mergedRef = useCallback(
        (node: HTMLDivElement | null) => {
            setNodeRef(node);
            // canvasRef is a RefObject — assign .current directly
            (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        },
        [setNodeRef, canvasRef],
    );

    return (
        <div
            ref={mergedRef}
            onClick={(e) => {
                if (e.target === canvasRef.current) {
                    setSelectedId(null);
                }
            }}
            className={`flex-1 min-w-0 min-h-0 overflow-hidden z-10 rounded-xl relative transition-all duration-200 border ${isOver
                ? isDark
                    ? 'bg-[#2d1f5e]/40 border-[#7c3aed] shadow-[inset_0_0_20px_rgba(124,58,237,0.3)]'
                    : 'bg-[#f3e8ff] border-[#7c3aed] shadow-[inset_0_0_20px_rgba(124,58,237,0.3)]'
                : isDark
                    ? 'bg-[#161625] border-[#2a2d45] shadow-sm'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
        >
            {isOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <span className="font-bold text-sm px-4 py-1.5 rounded-full shadow-md bg-[#7c3aed] text-white">
                        Drop here
                    </span>
                </div>
            )}
            {children}
        </div>
    );
};

// Extracted element component — lazy-loads from the element registry
const SceneElement = memo(({ el, isDark, isSelected, updateElement, setSelectedId, containerRef }: any) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedId(el.id);
    }, [el.id, setSelectedId]);

    const [sx, sy] = el.scale;
    const [BASE_W, BASE_H] = el.boundingSize ?? [200, 60];
    const w = BASE_W * sx;
    const h = BASE_H * sy;

    const ElementComponent = getElementComponent(el.type);

    return (
        <>
            {/* The actual element */}
            <div
                className={`canvas-element-${el.id}`}
                onClick={handleClick}
                style={{
                    position: 'absolute',
                    left: el.position[0] - w / 2,
                    top: el.position[1] - h / 2,
                    width: w,
                    height: h,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    zIndex: isSelected ? 1000 : (el.zIndex ?? 1),
                    pointerEvents: 'auto',
                    overflow: 'visible',
                    transform: `rotate(${el.rotation?.[2] ?? 0}deg)`,
                }}
            >
                {ElementComponent ? (
                    <Suspense fallback={
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4, fontSize: 24 }}>⏳</div>
                    }>
                        <ElementComponent
                            isDark={isDark}
                            style={{ width: '100%', boxSizing: 'border-box', pointerEvents: 'none' }}
                            {...(el.props ?? {})}
                        />
                    </Suspense>
                ) : (
                    <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 500, opacity: 0.6 }}>{el.type}</div>
                )}
            </div>

            {isSelected && (
                <CanvaBoundingBox
                    el={el}
                    updateElement={updateElement}
                    containerRef={containerRef}
                />
            )}
        </>
    );
});

const SaasVideoEditor = () => {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [templateSearchQuery, setTemplateSearchQuery] = useState('');
    const [mediaSearchQuery, setMediaSearchQuery] = useState('');
    const [positionSearchQuery, setPositionSearchQuery] = useState('');
    const [animationSearchQuery, setAnimationSearchQuery] = useState('');
    const [positionSubTab, setPositionSubTab] = useState<'Arrange' | 'Layers'>('Arrange');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [selectedAnimationId, setSelectedAnimationId] = useState<string | null>(null);

    // Infinite Query Hook for Elements
    const elementsPageSize = 12;
    const { 
        data: elementsData, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        fetchPreviousPage, 
        hasPreviousPage, 
        isFetchingPreviousPage, 
        isLoading: isElementsLoading 
    } = useInfiniteElements(searchQuery, elementsPageSize, selectedCategory);
    const flatElements = elementsData?.pages.flatMap((page) => page.data) ?? [];

    const { data: templatesData, isLoading: isTemplatesLoading } = useTemplates(templateSearchQuery);
    const flatTemplates = templatesData?.pages.flatMap((page) => page.data) ?? [];

    const { data: mediaData, isLoading: isMediaLoading } = useMedia(mediaSearchQuery);
    const flatMedia = mediaData?.pages.flatMap((page) => page.data) ?? [];

    const { data: positionsData, isLoading: isPositionsLoading } = usePositions(positionSearchQuery);
    const flatPositions = positionsData?.pages.flatMap((page) => page.data) ?? [];

    const { data: animationsData, isLoading: isAnimationsLoading } = useAnimations(animationSearchQuery);
    const flatAnimations = animationsData?.pages.flatMap((page) => page.data) ?? [];

    // Canvas States (global store)
    const {
        elements,
        elementIds,
        addElement,
        updateElement,
        reorderElements,
        removeElement,
    } = useEditorStore();
    const { 
        selectedId, setSelectedId,
        isPlaying, setIsPlaying,
        currentTime, setCurrentTime,
        activeScene, setActiveScene
    } = useUIStore();

    useEffect(() => {
        if (selectedId) {
            // Check existence imperatively, not as dependency
            const exists = useEditorStore.getState().elements.has(selectedId);
            if (!exists) setSelectedId(null);
        }
    }, [selectedId, setSelectedId]);
 
     const sensors = useSensors(
         useSensor(PointerSensor, {
             activationConstraint: { distance: 5 },
         })
     );


    // Undo/redo state — subscribe to store so buttons re-render on history change
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    useEffect(() => {
        const controls = getHistoryControls();
        const sync = () => {
            setCanUndo(controls.canBack());
            setCanRedo(controls.canForward());
        };
        sync();
        
        window.addEventListener('history-updated', sync);
        const unsub = useEditorStore.subscribe(sync);
        return () => {
            window.removeEventListener('history-updated', sync);
            unsub();
        };
    }, []);
    const [activeDragItem, setActiveDragItem] = useState<string | null>(null);
    const [savedActiveTab, setSavedActiveTab] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    // Tracks the live pointer position during a dnd-kit drag so handleDragEnd
    // can use the actual cursor location instead of the (wrong) sidebar-card rect.
    const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Derived dnd-kit state (replaces isDragOver / isDraggingElement)
    const isDraggingElement = activeDragItem !== null;

    // Keyboard shortcuts (undo, redo, delete, escape)
    useEffect(() => {
        // Helper to check if the user is actively typing in a text field
        const isTyping = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Let the browser handle text editing natively if we're in an input
            if (isTyping(e)) {
                if (e.key === 'Escape') {
                    (e.target as HTMLElement).blur();
                    setSelectedId(null);
                }
                return;
            }

            // Undo: Ctrl+Z
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                getHistoryControls().back();
            }
            
            // Redo: Ctrl+Shift+Z or Ctrl+Y
            if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')) {
                e.preventDefault();
                getHistoryControls().forward();
            }
            
            // Delete: Delete or Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                e.preventDefault();
                removeElement(selectedId);
                getHistoryControls().archive(); // Archive the deletion
                window.dispatchEvent(new CustomEvent('history-updated'));
            }

            // Escape: unselect
            if (e.key === 'Escape') {
                setSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, setSelectedId, removeElement]);

    // Settings States
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
    const [defaultPanelExpanded, setDefaultPanelExpanded] = useState(true);
    const [toolbarShouldCenter, setToolbarShouldCenter] = useState(false);
    const [isRightPanelAnimationOpen, setIsRightPanelAnimationOpen] = useState(false);

    useEffect(() => {
        const checkIfExpanded = () => {
            // Detect maximized window: innerHeight is >= availHeight minus taskbar threshold
            const isExpanded = window.innerHeight >= window.screen.availHeight - 80;
            setToolbarShouldCenter(isExpanded);
        };
        checkIfExpanded();
        window.addEventListener('resize', checkIfExpanded);
        return () => window.removeEventListener('resize', checkIfExpanded);
    }, []);

    // Computed Theme
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            setIsDark(true);
        } else if (theme === 'light') {
            setIsDark(false);
        } else {
            setIsDark(false);
        }
    }, [theme]);

    /* ─── @dnd-kit handlers ─── */
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const id = event.active.id as string;
        
        // ONLY handle drags that are FROM the sidebar elements
        if (!id.startsWith('sidebar-')) return;
        
        setActiveDragItem(id);
        setSavedActiveTab(activeTab);
        setActiveTab(null);
    }, [activeTab]);

    // Update the ref via a native pointermove listener — runs outside React's event system
    // so it captures every pixel of movement even when dnd-kit batches its synthetic events.
    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            pointerRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('pointermove', onPointerMove);
        return () => window.removeEventListener('pointermove', onPointerMove);
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        
        setActiveDragItem(null);

        if (over?.id !== 'canvas-dropzone') {
            setActiveTab(savedActiveTab);
            return;
        }

        // Extract type from ID (reliable method)
        const activeId = active.id?.toString() || '';
        const type = activeId.startsWith('sidebar-') 
            ? activeId.replace('sidebar-', '') 
            : active.data?.current?.type;
        
        if (!type || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();

        // Use the drag overlay's final position
        const overlayRect = active.rect.current.translated;
        
        if (!overlayRect) return;

        // Calculate drop position as center of the drag overlay, in pixel coords
        const clientX = overlayRect.left + overlayRect.width / 2;
        const clientY = overlayRect.top + overlayRect.height / 2;

        const dropX = clientX - canvasRect.left;
        const dropY = clientY - canvasRect.top;

        // Resolve bounding size from PANEL_ELEMENTS registry, or fallback
        const panelDef = PANEL_ELEMENTS.find(el => el.type === type);
        const resolvedBoundingSize: [number, number] = 
            active.data.current?.boundingSize ?? 
            panelDef?.boundingSize ?? 
            [200, 80];

        addElement({
            id: Date.now().toString(),
            type: type as any,
            position: [dropX, dropY, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            boundingSize: resolvedBoundingSize,
            props: panelDef?.defaultProps ?? {},
        });

        getHistoryControls().archive();
    }, [addElement, savedActiveTab]);

    return (
        <DndContext 
            sensors={sensors} 
            modifiers={[snapCenterToCursor]}
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
        >
            <div className={`fixed inset-0 flex flex-col p-[10px] gap-[10px] overflow-hidden transition-colors duration-200 ${isDark ? 'dark bg-[#080810] text-white' : 'bg-[#f3f4f6] text-gray-900'}`}>

                {/* 2. Top navigation bar */}
                <div className={`h-[56px] rounded-xl shadow-sm flex-shrink-0 flex items-center justify-between px-4 z-[60] transition-colors duration-200 overflow-hidden ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-transparent'}`}>

                    {/* LEFT SIDE: Logo & History */}
                    <div className="flex items-center gap-4">
                        <span className={`font-bold text-[18px] ${isDark ? 'text-white' : 'text-gray-900'}`}>Cliply</span>
                        <div className={`flex items-center gap-1 border-l pl-4 ${isDark ? 'border-[#2a2d45]' : 'border-gray-200'}`}>
                            <button
                                onClick={() => getHistoryControls().back()}
                                disabled={!canUndo}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${!canUndo ? 'opacity-40 cursor-not-allowed' : ''} ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <Undo2 size={18} />
                            </button>
                            <button
                                onClick={() => getHistoryControls().forward()}
                                disabled={!canRedo}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${!canRedo ? 'opacity-40 cursor-not-allowed' : ''} ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <Redo2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* CENTER: Project Name */}
                    <div className="flex flex-1 justify-center">
                        <input
                            type="text"
                            defaultValue="Untitled Project"
                            className={`text-center bg-transparent border border-transparent outline-none rounded-lg text-sm font-medium w-48 py-1 transition-all ${isDark ? 'hover:border-gray-700 focus:border-gray-600 focus:bg-gray-800 text-white' : 'hover:border-gray-200 focus:border-gray-200 text-gray-900'}`}
                        />
                    </div>

                    {/* RIGHT SIDE: Actions */}
                    <div className="flex items-center gap-3 relative">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`p-1.5 mr-1 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                            title="Settings"
                        >
                            <SettingsIcon size={18} />
                        </button>
                        <button className={`flex items-center gap-2 px-4 py-1.5 border text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer ${isDark ? 'border-[#2a2d45] bg-[#1e2235] text-gray-200 hover:bg-[#252840]' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
                            <Play size={16} />
                            Preview
                        </button>
                        <button
                            onClick={() => window.open('/export', '_blank')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer border-none"
                        >
                            <Download size={16} />
                            Export MP4
                        </button>
                    </div>

                </div>

                {/* Settings Backdrop & Panel */}
                {isSettingsOpen && (
                    <>
                        <div
                            className="absolute inset-0 z-[90] bg-transparent"
                            onClick={() => setIsSettingsOpen(false)}
                        />
                        <div className={`absolute top-[72px] right-[24px] w-[280px] rounded-xl shadow-xl z-[100] flex flex-col transition-colors duration-200 ${isDark ? 'bg-[#1e2235] border border-[#2a2d45] text-white' : 'bg-white text-gray-900 border border-gray-100'}`}>
                            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#2a2d45]' : 'border-gray-100'}`}>
                                <span className="font-bold text-[14px]">Settings</span>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className={`p-1 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-4 flex flex-col gap-6">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">Appearance</span>
                                        <span className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Choose your theme preference</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        {[
                                            { id: 'light', icon: Sun, label: 'Light' },
                                            { id: 'dark', icon: Moon, label: 'Dark' },
                                            { id: 'system', icon: Monitor, label: 'System' }
                                        ].map((opt) => {
                                            const isSelected = theme === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setTheme(opt.id as any)}
                                                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                                        ? 'border-[#7c3aed] bg-[#ede9fe] text-[#7c3aed]'
                                                        : isDark
                                                            ? 'border-[#2a2d45] bg-transparent text-gray-400 hover:bg-[#252840] hover:text-gray-200'
                                                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                                        }`}
                                                >
                                                    <opt.icon size={18} className="mb-2" />
                                                    <span className="text-xs font-medium">{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-transparent">
                                        <span className="text-sm font-medium">Panel expanded by default</span>
                                        <div
                                            onClick={() => setDefaultPanelExpanded(!defaultPanelExpanded)}
                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${defaultPanelExpanded ? 'bg-[#7c3aed]' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                                        >
                                            <div
                                                className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${defaultPanelExpanded ? 'translate-x-4' : 'translate-x-0'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* 3. Main content area */}
                <div className="flex flex-col flex-1 min-w-0 min-h-0 relative gap-[10px]">

                    {/* Middle Section: Left, Center, Right */}
                    <div className="flex flex-1 min-w-0 min-h-0 gap-[10px]">

                        {/* Vertical Toolbar */}
                        <div className={`w-[52px] flex-shrink-0 ${toolbarShouldCenter ? 'self-center' : ''} flex flex-col items-center gap-3 pt-3 pb-3 z-50 rounded-xl overflow-hidden shadow-sm transition-colors duration-200 ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-transparent'}`}>
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            const newTab = isActive ? null : tab.id;
                                            setActiveTab(newTab);
                                            // Close right panel when any left panel opens
                                            if (newTab) setIsRightPanelAnimationOpen(false);
                                        }}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${isActive
                                            ? isDark
                                                ? 'bg-[#4c1d95] text-[#a78bfa]'
                                                : 'bg-[#ede9fe] text-[#7c3aed]'
                                            : isDark
                                                ? 'bg-transparent text-gray-400 hover:text-white hover:bg-[#252840]'
                                                : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                        title={tab.label}
                                    >
                                        <tab.icon size={20} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Floating Panel Backdrop - pointer-events-none during drag so canvas can receive drop */}
                        {activeTab && (
                            <div
                                className={`absolute inset-0 z-30 bg-transparent ${isDraggingElement ? 'pointer-events-none' : ''}`}
                                onClick={() => setActiveTab(null)}
                            />
                        )}

                        {/* Floating Panel (Absolute position) */}
                        <div
                            className={`absolute top-0 left-[62px] bottom-0 rounded-xl overflow-hidden z-40 flex flex-col transition-all duration-300 ease-in-out ${activeTab ? 'translate-x-0 shadow-xl opacity-100' : '-translate-x-12 opacity-0 pointer-events-none'
                                } ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-gray-100'}`}
                            style={{ width: '480px' }}
                        >
                            {activeTab && (
                                <>
                                    <div className="flex-1 min-h-0 flex flex-col">
                                        {activeTab === 'Elements' && !selectedCategory && !searchQuery ? (
                                            <UniversalPanel
                                                title="Elements"
                                                onClose={() => { setActiveTab(null); }}
                                                items={ELEMENT_CATEGORIES}
                                                width={480}
                                                height="100%"
                                                itemHeight={140}
                                                searchQuery={searchQuery}
                                                onSearchChange={setSearchQuery}
                                                placeholder="Search elements..."
                                                getItemId={(cat) => cat.id}
                                                getItemLabel={(cat) => cat.label}
                                                panelName="Categories"
                                                panelIcon={Layers}
                                                isDark={isDark}
                                                showCloseButton={true}
                                                renderItem={(cat) => (
                                                    <div 
                                                        onClick={() => setSelectedCategory(cat.id)} 
                                                        className={`cursor-pointer w-full h-[140px] flex flex-col items-center justify-center border rounded-xl hover:scale-[1.03] transition-transform select-none ${isDark ? 'bg-[#1e2235] border-[#2a2d45] text-white shadow-md' : 'bg-white border-gray-200 text-gray-800 shadow-sm'}`}
                                                    >
                                                        <span className="text-[40px] mb-3">{cat.emoji}</span>
                                                        <span className="font-semibold text-[15px]">{cat.label}</span>
                                                    </div>
                                                )}
                                            />
                                        ) : activeTab === 'Elements' ? (
                                            <UniversalPanel
                                                title={selectedCategory ? (
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setSelectedCategory(null); }}
                                                            className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                                                        >
                                                            <ArrowLeft size={18} />
                                                        </button>
                                                        <span>{ELEMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Elements"}</span>
                                                    </div>
                                                ) : "Elements"}
                                                onClose={() => { setActiveTab(null); setSelectedCategory(null); setSearchQuery(''); }}
                                                items={flatElements}
                                                pageSize={elementsPageSize}
                                                firstPageParam={elementsData?.pageParams?.[0] as number ?? 0}
                                                width={480}
                                                height="100%"
                                                itemHeight={140}
                                                searchQuery={searchQuery}
                                                onSearchChange={setSearchQuery}
                                                placeholder="Search elements..."
                                                isLoading={isElementsLoading}
                                                isFetchingNextPage={isFetchingNextPage}
                                                hasNextPage={hasNextPage}
                                                fetchNextPage={fetchNextPage}
                                                isFetchingPreviousPage={isFetchingPreviousPage}
                                                hasPreviousPage={hasPreviousPage}
                                                fetchPreviousPage={fetchPreviousPage}
                                                getItemId={(el) => el.type}
                                                getItemLabel={(el) => el.label}
                                                panelName={selectedCategory ? ELEMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Elements" : "Elements"}
                                                panelIcon={Layers}
                                                isDark={isDark}
                                                showCloseButton={true}
                                                renderItem={(el) => (
                                                    <DraggableElementCard
                                                        element={el}
                                                        isDark={isDark}
                                                    />
                                                )}
                                            />
                                        ) : activeTab === 'Templates' ? (
                                            <UniversalPanel
                                                title="Templates"
                                                onClose={() => { setActiveTab(null); }}
                                                items={flatTemplates}
                                                width={480}
                                                height="100%"
                                                itemHeight={140}
                                                searchQuery={templateSearchQuery}
                                                onSearchChange={setTemplateSearchQuery}
                                                placeholder="Search templates..."
                                                isLoading={isTemplatesLoading}
                                                isFetchingNextPage={false}
                                                hasNextPage={false}
                                                fetchNextPage={undefined}
                                                getItemId={(el) => el.id}
                                                getItemLabel={(el) => el.label}
                                                panelName="Templates"
                                                panelIcon={LayoutTemplate}
                                                isDark={isDark}
                                                showCloseButton={true}
                                                renderItem={(el) => (
                                                    <DraggableCard
                                                        elementId={el.id}
                                                        icon={el.icon}
                                                        label={el.label}
                                                        isDark={isDark}
                                                    />
                                                )}
                                            />
                                        ) : activeTab === 'Media' ? (
                                            <UniversalPanel
                                                title="Media"
                                                onClose={() => { setActiveTab(null); }}
                                                items={flatMedia}
                                                width={480}
                                                height="100%"
                                                itemHeight={140}
                                                searchQuery={mediaSearchQuery}
                                                onSearchChange={setMediaSearchQuery}
                                                placeholder="Search assets..."
                                                isLoading={isMediaLoading}
                                                isFetchingNextPage={false}
                                                hasNextPage={false}
                                                fetchNextPage={undefined}
                                                getItemId={(el) => el.id}
                                                getItemLabel={(el) => el.label}
                                                panelName="Media"
                                                panelIcon={Video}
                                                isDark={isDark}
                                                showCloseButton={true}
                                                renderItem={(el) => (
                                                    <div 
                                                        onClick={() => {
                                                            addElement({
                                                                id: Date.now().toString(),
                                                                type: 'videoPlaceholder' as any,
                                                                position: [400, 225, 0],
                                                                rotation: [0, 0, 0],
                                                                scale: [1, 1, 1],
                                                                boundingSize: [280, 180],
                                                                props: { url: el.url, thumbnail: el.thumbnail, label: el.label }
                                                            });
                                                            getHistoryControls().archive();
                                                        }}
                                                        className={`relative w-full h-[140px] rounded-xl overflow-hidden cursor-pointer border group hover:scale-[1.03] transition-all ${isDark ? 'border-[#2a2d45] bg-[#161625]' : 'border-gray-200 bg-gray-50'}`}
                                                    >
                                                        <img src={el.thumbnail} alt={el.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                                                            <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm">{el.duration}</span>
                                                        </div>
                                                        <div className="absolute top-2 left-2 pointer-events-none">
                                                            <span className="text-[10px] font-bold text-white bg-[#7c3aed]/80 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm">VIDEO</span>
                                                        </div>
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-lg">
                                                                <Play size={20} className="text-white fill-current" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        ) : activeTab === 'Position' ? (
                                            <UniversalPanel
                                                title="Position"
                                                onClose={() => { setActiveTab(null); }}
                                                items={positionSubTab === 'Arrange' ? flatPositions : [...Array.from(elements.values()).reverse(), { id: 'canvas-background', type: 'background', label: 'Background' }]}
                                                width={480}
                                                height="100%"
                                                itemHeight={positionSubTab === 'Arrange' ? 140 : 70}
                                                columnCount={positionSubTab === 'Arrange' ? 3 : 1}
                                                searchQuery={positionSearchQuery}
                                                onSearchChange={setPositionSearchQuery}
                                                placeholder="Search..."
                                                isLoading={isPositionsLoading}
                                                isFetchingNextPage={false}
                                                hasNextPage={false}
                                                fetchNextPage={undefined}
                                                getItemId={(el) => (el as any).id}
                                                getItemLabel={(el) => (el as any).label || (el as any).type || ''}
                                                panelName="Positions"
                                                panelIcon={Move}
                                                isDark={isDark}
                                                showCloseButton={true}
                                                showSearch={false}
                                                showSubtitle={false}
                                                onReorder={(oldIdx, newIdx) => {
                                                    // Since the list is reversed, we need to convert indices back to original
                                                    const total = Array.from(elements.values()).length;
                                                    reorderElements(total - 1 - oldIdx, total - 1 - newIdx);
                                                }}
                                                customHeaderContent={
                                                    <div className={`flex p-1 mb-4 rounded-xl ${isDark ? 'bg-[#161625] border border-[#2a2d45]' : 'bg-gray-100'}`}>
                                                        {['Arrange', 'Layers'].map((tab) => {
                                                            const isActive = positionSubTab === tab;
                                                            return (
                                                                <button
                                                                    key={tab}
                                                                    onClick={() => setPositionSubTab(tab as any)}
                                                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${isActive 
                                                                        ? 'bg-[#7c3aed] text-white shadow-md' 
                                                                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                                                >
                                                                    {tab}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                }
                                                renderItem={(el: any, _index: number, listeners?: any, attributes?: any) => positionSubTab === 'Arrange' ? (
                                                    <div 
                                                        onClick={() => {
                                                            if (selectedId && canvasRef.current) {
                                                                const rect = canvasRef.current.getBoundingClientRect();
                                                                updateElement(selectedId, {
                                                                    position: [(el.x / 100) * rect.width, (el.y / 100) * rect.height, 0]
                                                                });
                                                                getHistoryControls().archive();
                                                                window.dispatchEvent(new CustomEvent('history-updated'));
                                                            }
                                                        }}
                                                        className={`w-full h-[140px] flex flex-col items-center justify-center border rounded-xl hover:scale-[1.03] transition-all cursor-pointer shadow-sm group ${isDark ? 'bg-[#1e2235] border-[#2a2d45] text-white hover:border-[#7c3aed] hover:bg-[#2d1f5e]' : 'bg-white border-gray-200 text-gray-800 hover:border-[#7c3aed] hover:bg-[#ede9fe]'}`}
                                                    >
                                                        <div className={`p-4 rounded-full mb-3 transition-colors ${isDark ? 'bg-[#252840] group-hover:bg-[#4c1d95]' : 'bg-gray-50 group-hover:bg-[#ddd6fe]'}`}>
                                                            <el.icon size={28} className={`transition-colors ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-[#7c3aed]'}`} />
                                                        </div>
                                                        <span className="font-semibold text-[14px]">{el.label}</span>
                                                    </div>
                                                ) : el.id === 'canvas-background' ? (
                                                    <div 
                                                        onClick={() => setSelectedId('canvas-background')}
                                                        className={`mx-2 mb-1.5 h-[64px] flex items-center transition-all cursor-pointer group select-none border rounded-xl overflow-hidden ${selectedId === 'canvas-background' 
                                                            ? isDark ? 'bg-[#2d1f5e] border-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.15)]' : 'bg-[#ede9fe] border-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                                                            : isDark ? 'bg-[#2a2a35] border-[#3a3a45] hover:border-[#7c3aed]/50' : 'bg-gray-100/80 border-gray-200 hover:border-[#7c3aed]/30 hover:shadow-sm'}`}
                                                    >
                                                        <div className="flex-1 flex items-center justify-between min-w-0 px-3 pr-4">
                                                            <div className="flex-1 flex items-center gap-3 min-w-0">
                                                                <div className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-white shadow-inner border border-gray-200/50'}`}>
                                                                    <div className="w-full h-full rounded-lg overflow-hidden" style={{ backgroundColor: 'white' }} />
                                                                </div>
                                                            </div>

                                                            <div className="ml-4 flex-shrink-0">
                                                                <div 
                                                                    className={`w-8 h-8 rounded-lg border transition-colors flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                                                    title="Background"
                                                                >
                                                                    <div 
                                                                        className="absolute inset-0 opacity-40" 
                                                                        style={{ 
                                                                            backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 4px)',
                                                                            color: isDark ? '#9ca3af' : '#6b7280'
                                                                        }} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        onClick={() => setSelectedId(el.id)}
                                                        {...attributes} 
                                                        {...listeners}
                                                        className={`mx-2 mb-1.5 h-[64px] flex items-center cursor-grab active:cursor-grabbing group select-none border rounded-xl overflow-hidden touch-none ${selectedId === el.id 
                                                            ? isDark ? 'bg-[#2d1f5e] border-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.15)]' : 'bg-[#ede9fe] border-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                                                            : isDark ? 'bg-[#2a2a35] border-[#3a3a45] hover:border-[#7c3aed]/50' : 'bg-gray-100/80 border-gray-200 hover:border-[#7c3aed]/30 hover:shadow-sm'}`}
                                                    >
                                                        <div 
                                                            className={`flex items-center justify-center w-10 h-full flex-shrink-0 transition-colors ${isDark ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-300 group-hover:text-gray-500'}`}
                                                        >
                                                            <GripVertical size={22} strokeWidth={3} />
                                                        </div>

                                                        <div className="flex-1 flex items-center justify-center min-w-0 pr-4 relative overflow-hidden">
                                                            {/* Element Preview in Middle */}
                                                            {(() => {
                                                                const ElementComponent = getElementComponent(el.type) as React.ElementType;
                                                                if (!ElementComponent) return null;
                                                                
                                                                // Extract base size for proportions
                                                                const [baseW, baseH] = el.boundingSize ?? [200, 60];
                                                                const ratio = baseH / baseW;
                                                                
                                                                return (
                                                                    <div className="flex items-center justify-center pointer-events-none select-none opacity-90 transition-transform duration-200" style={{ transform: 'scale(0.28)', transformOrigin: 'center center' }}>
                                                                        <Suspense fallback={null}>
                                                                            <ElementComponent 
                                                                                isDark={isDark} 
                                                                                style={{ 
                                                                                    width: 140, 
                                                                                    height: 140 * ratio,
                                                                                }} 
                                                                                {...(el.props ?? {})} 
                                                                            />
                                                                        </Suspense>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                        
                                                        <div className="pr-3 flex-shrink-0 relative">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === el.id ? null : el.id); }}
                                                                    className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                                                    title="More Actions"
                                                                >
                                                                    <MoreVertical size={20} />
                                                                </button>

                                                                {activeMenuId === el.id && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                                                        <div className={`absolute right-0 top-full mt-1 w-32 py-1.5 z-20 rounded-lg shadow-xl border animate-in fade-in zoom-in duration-100 origin-top-right ${isDark ? 'bg-[#1e2235] border-[#2a2d45]' : 'bg-white border-gray-100'}`}>
                                                                            <button 
                                                                                onClick={(e) => { 
                                                                                    e.stopPropagation(); 
                                                                                    removeElement(el.id); 
                                                                                    getHistoryControls().archive(); 
                                                                                    window.dispatchEvent(new CustomEvent('history-updated'));
                                                                                    setActiveMenuId(null);
                                                                                }}
                                                                                className={`w-full px-3 py-1.5 text-left text-sm font-bold flex items-center gap-2 transition-colors ${isDark ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}
                                                                            >
                                                                                <X size={14} />
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                )}
                                            />
                                        ) : (
                                            <div className={`text-sm font-medium px-4 pt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {activeTab} content here
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 5. Center Canvas area (droppable) */}
                        <CanvasDropZone
                            canvasRef={canvasRef}
                            isDark={isDark}
                            setSelectedId={setSelectedId}
                        >
                            {/* 2D HTML Canvas Surface */}
                            <div
                                style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) setSelectedId(null);
                                }}
                            >
                                {elementIds.map((id, idx) => {
                                    const el = elements.get(id);

                                    if (!el) return null;
                                    const isSelected = el.id === selectedId;

                                    return (
                                        <SceneElement 
                                            key={el.id}
                                            el={{ ...el, zIndex: idx + 1 }}
                                            isDark={isDark}
                                            isSelected={isSelected}
                                            updateElement={updateElement}
                                            setSelectedId={setSelectedId}
                                            containerRef={canvasRef}
                                        />
                                    );
                                })}
                            </div>
                        </CanvasDropZone>

                        {/* 6. Right panel Backdrop */}
                        {isRightPanelAnimationOpen && (
                            <div
                                className="absolute inset-0 z-30 bg-transparent"
                                onClick={() => setIsRightPanelAnimationOpen(false)}
                            />
                        )}

                        {/* 6. Right Floating Panel (Animations) */}
                        <div
                            className={`absolute top-0 right-[290px] bottom-0 rounded-xl overflow-hidden z-40 flex flex-col transition-all duration-300 ease-in-out ${isRightPanelAnimationOpen ? '-translate-x-0 shadow-xl opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'
                                } ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-gray-100'}`}
                            style={{ width: '480px' }}
                        >
                            <div className="flex-1 min-h-0 flex flex-col">
                                <UniversalPanel
                                    title="Animations"
                                    onClose={() => setIsRightPanelAnimationOpen(false)}
                                    items={flatAnimations}
                                    width={480}
                                    height="100%"
                                    itemHeight={140}
                                    fetchNextPage={undefined}
                                    searchQuery={animationSearchQuery}
                                    onSearchChange={setAnimationSearchQuery}
                                    placeholder="Search animations..."
                                    isLoading={isAnimationsLoading}
                                    isFetchingNextPage={false}
                                    hasNextPage={false}
                                    getItemId={(preset) => preset.id}
                                    getItemLabel={(preset) => preset.label}
                                    panelName="Animations"
                                    panelIcon={Sparkles}
                                    isDark={isDark}
                                    showCloseButton={true}
                                    renderItem={(preset) => (
                                        <AnimationCard
                                            preset={preset}
                                            isDark={isDark}
                                            isSelected={selectedAnimationId === preset.id}
                                            onSelect={() => setSelectedAnimationId(preset.id)}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* 6. Main Right static panel */}
                        <div className={`w-[280px] p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto rounded-xl shadow-sm transition-colors duration-200 z-10 relative ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-transparent'}`}>
                            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Properties
                            </span>
                            <button
                                onClick={() => {
                                    const newState = !isRightPanelAnimationOpen;
                                    setIsRightPanelAnimationOpen(newState);
                                    // Close left panel when Animations opens
                                    if (newState) setActiveTab(null);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors cursor-pointer group ${isRightPanelAnimationOpen
                                    ? 'border-[#7c3aed] bg-[#7c3aed] text-white shadow-sm'
                                    : isDark
                                        ? 'border-[#2a2d45] hover:border-[#7c3aed] text-gray-300 bg-[#161625]'
                                        : 'border-gray-200 hover:border-[#7c3aed] hover:bg-[#ede9fe] text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className={isRightPanelAnimationOpen ? "text-white" : isDark ? "text-gray-400 group-hover:text-[#7c3aed]" : "text-gray-400 group-hover:text-[#7c3aed]"} />
                                    <span className="text-sm font-medium">Animations</span>
                                </div>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isRightPanelAnimationOpen ? "rotate-180" : "-rotate-90"} ${isRightPanelAnimationOpen ? "text-white" : isDark ? "text-gray-500" : "text-gray-400"}`} />
                            </button>
                        </div>
                    </div>

                    {/* 7. Bottom bar (Timeline) */}
                    <Timeline
                        currentTime={currentTime}
                        setCurrentTime={setCurrentTime}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        activeScene={activeScene}
                        setActiveScene={setActiveScene}
                        isDark={isDark}
                    />

                </div>
            </div>

            {/* Drag overlay — renders the floating card while dragging */}
            <DragOverlay dropAnimation={null}>
                {activeDragItem != null && (() => {
                    // Check UI_ELEMENTS first
                    const elementEntry = UI_ELEMENTS.find(
                        (el) => `sidebar-${el.type}` === activeDragItem
                    );
                    if (elementEntry) {
                        const getIcon = (type: string) => {
                            if (type === 'button') return Square;
                            if (type === 'card') return AppWindow;
                            if (type === 'list') return Move;
                            return Box;
                        };
                        return <DragOverlayCard icon={getIcon(elementEntry.type)} label={elementEntry.label} />;
                    }
                    
                    // Check TEMPLATES
                    const templateEntry = TEMPLATES.find(
                        (t) => `sidebar-${t.id}` === activeDragItem
                    );
                    if (templateEntry) return <DragOverlayCard icon={templateEntry.icon} label={templateEntry.label} />;
                    
                    return null;
                })()}
            </DragOverlay>
        </DndContext>
    );
};

export default SaasVideoEditor;
