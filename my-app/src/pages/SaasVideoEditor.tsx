import { useState, useEffect, useRef, useCallback, memo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { CanvaBoundingBox } from '../components/CanvaBoundingBox';
import { UniversalPanel } from '../components/UniversalPanel';
import { Timeline } from '../components/Timeline';
import { useEditorStore, useUIStore, getHistoryControls } from '../store/useEditorStore';
import { PANEL_ELEMENTS, getElementComponent, ELEMENT_CATEGORIES } from '../components/elements';
import type { PanelElementDef } from '../components/elements';

import {
    draggable,
    dropTargetForElements,
    monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
    Undo2, Redo2, Play, Download,
    Layers, Video, Sparkles, LayoutTemplate,
    X, Settings as SettingsIcon, Sun, Moon, Monitor,
    Move, Smartphone, ArrowLeft, GripVertical, MoreVertical,
    Box, PieChart, AppWindow, Smile, Triangle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


const TABS = [
    { id: 'Elements', icon: Layers, label: 'Elements' },
    { id: 'Media', icon: Video, label: 'Media' },
    { id: 'Position', icon: Move, label: 'Position' },
    { id: 'Animations', icon: Sparkles, label: 'Animations' },
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

const MEDIA_STOCK: any[] = [];

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
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        return draggable({
            element: el,
            getInitialData: () => ({ type: element.type, label: element.label, boundingSize: element.boundingSize }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [element]);

    const PreviewComponent = getElementComponent(element.type) as unknown as React.ElementType<any>;

    return (
        <div
            ref={ref}
            className={`relative w-full h-[120px] hover:cursor-grab group touch-none ${isDragging ? 'opacity-40' : ''}`}
        >
            <div className={`relative w-full h-full flex flex-col items-center justify-between p-3 border rounded-xl z-10 transition-all duration-300 overflow-hidden ${isDark
                ? 'bg-[#161625] border-[#2a2d45] group-hover:border-[#7c3aed] group-hover:bg-[#2d1f5e]'
                : 'bg-white border-gray-200 shadow-sm group-hover:border-[#7c3aed] group-hover:bg-[#ede9fe] group-hover:shadow-md'}`}>
                {/* Preview: actual component or fallback emoji */}
                <div className="flex-1 w-full flex items-center justify-center select-none pointer-events-none" style={{ transform: "scale(0.55)", transformOrigin: "center center" }}>
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

/* ─── Draggable sidebar card (uses Pragmatic Drag and Drop) ─── */
const DraggableCard = ({ elementId, icon: Icon, label, isDark }: {
    elementId: string;
    icon: LucideIcon;
    label: string;
    isDark: boolean;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        return draggable({
            element: el,
            getInitialData: () => ({ type: elementId }), // ID is used as type in the original code
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [elementId]);

    return (
        <div
            ref={ref}
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


/* ─── Canvas drop zone (uses Pragmatic Drag and Drop) ─── */
// FIX: Uses direct DOM manipulation (refs) instead of useState for hover state.
// This means onDragEnter / onDragLeave NEVER trigger a React re-render — zero
// VirtualizedGrid re-renders during the entire mouse-movement of a drag.
const CanvasDropZone = ({ canvasRef, isDark, setSelectedId, children, className = '', style = {} }: {
    canvasRef: React.RefObject<HTMLDivElement | null>;
    isDark: boolean;
    setSelectedId: (id: string | null) => void;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) => {
    const localRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Apply/remove the hover style directly on the DOM node — NO setState, NO re-render
    const applyOver = (over: boolean) => {
        const el      = localRef.current;
        const overlay = overlayRef.current;
        if (!el) return;

        if (over) {
            // Canvas bg — background-color doesn't scale with transform, safe to set directly
            el.style.backgroundColor = isDark ? 'rgba(45,31,94,0.4)' : '#f3e8ff';
            // Apply drag ring and shadow directly to the canvas
            el.style.boxShadow = isDark
                ? '0 0 0 2px #7c3aed, inset 0 0 20px rgba(124,58,237,0.3), 0 4px 24px rgba(0,0,0,0.5)'
                : '0 0 0 2px #7c3aed, inset 0 0 20px rgba(124,58,237,0.15), 0 4px 16px rgba(0,0,0,0.12)';
            if (overlay) overlay.style.display = 'flex';
        } else {
            el.style.backgroundColor = isDark ? '#000' : '#fff';
            // Default flat border directly on canvas
            el.style.boxShadow = isDark
                ? '0 0 0 1px #2a2d45, 0 4px 24px rgba(0,0,0,0.5)'
                : '0 0 0 1px #e5e7eb, 0 4px 16px rgba(0,0,0,0.12)';
            if (overlay) overlay.style.display = 'none';
        }
    };

    useEffect(() => {
        const el = localRef.current;
        if (!el) return;

        // Initialize shadow layer to default state imperatively on mount
        // and whenever isDark changes. applyOver is the sole owner of
        // shadow.style.boxShadow — React never touches it via JSX style prop,
        // so no re-render can overwrite the purple ring mid-drag.
        applyOver(false);

        return dropTargetForElements({
            element: el,
            getData: () => ({ id: 'canvas-dropzone' }),
            onDragEnter: () => applyOver(true),
            onDragLeave: () => applyOver(false),
            onDrop:      () => applyOver(false),
        });
    }, [isDark]);

    // Merge the pdnd localRef with the existing canvasRef so both systems track the same div
    const mergedRef = useCallback(
        (node: HTMLDivElement | null) => {
            localRef.current = node;
            if (canvasRef) {
                (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
        },
        [canvasRef],
    );

    return (
        <div
            ref={mergedRef}
            onClick={(e) => {
                if (e.target === canvasRef.current) {
                    setSelectedId(null);
                }
            }}
            className={`relative overflow-hidden ${className} ${isDark ? 'bg-black' : 'bg-white'}`}
            style={style}
        >
            {/* Drop overlay — shown/hidden via direct DOM ref, NOT React state */}
            <div
                ref={overlayRef}
                style={{ display: 'none' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
                <span className="font-bold text-sm px-4 py-1.5 rounded-full shadow-md bg-[#7c3aed] text-white">
                    Drop here
                </span>
            </div>
            {children}
        </div>
    );
};

// ─── SceneElement ─────────────────────────────────────────────────────────────
// FIX: Component now accepts only PRIMITIVE props (id, zIndex) from the parent
// and self-subscribes to its own element slice via a fine-grained Zustand
// selector.  When element 'abc' changes, ONLY the SceneElement with id='abc'
// sees a new selector reference and re-renders.  All other 499 instances
// receive Object.is(prev, next) === true → React.memo bails out immediately.
// Cost: O(1) per mouse-move event, regardless of total canvas element count.
interface SceneElementProps {
    id: string;
    zIndex: number;
    isDark: boolean;
    isSelected: boolean;
    zoom: number;
    updateElement: (id: string, data: Partial<import('../store/useEditorStore').CanvasElement>) => void;
    setSelectedId: (id: string | null) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const SceneElement = memo(({ id, zIndex, isDark, isSelected, zoom, updateElement, setSelectedId, containerRef }: SceneElementProps) => {
    // Per-element selector: only this component re-renders when its own data changes.
    const el = useEditorStore((s) => s.elements[id]);

    const sceneElementRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
        setSelectedId(id);
    }, [id, setSelectedId]);

    // Guard: element may have been removed from the store while this component
    // is still in the reconciler queue.  Return null to unmount gracefully.
    if (!el) return null;

    const [BASE_W, BASE_H] = el.boundingSize ?? [200, 60];
    const ElementComponent = getElementComponent(el.type) as unknown as React.ElementType<any>;
    // zIndex comes from the parent map (idx + 1) as a plain number prop.
    // If this element is selected, bump it to 1000 so it floats above siblings.
    const resolvedZIndex = isSelected ? 1000 : zIndex;

    return (
        <>
            {/* The actual element */}
            <div
                ref={sceneElementRef}
                className={`canvas-element-${el.id}`}
                onPointerDown={handlePointerDown}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: BASE_W,
                    height: BASE_H,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    zIndex: resolvedZIndex,
                    pointerEvents: 'auto',
                    overflow: 'visible',
                    transform: `translate(${el.x ?? 0}px, ${el.y ?? 0}px) rotate(${el.rotation ?? 0}deg) scale(${el.scaleX ?? 1}, ${el.scaleY ?? 1})`,
                    opacity: el.opacity ?? 1,
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
                    targetRef={sceneElementRef}
                    zoom={zoom}
                />
            )}
        </>
    );
});

/* ─── Pan padding: 20px breathing room around canvas edges (Canva-style) ─── */
const PAN_PADDING = 20;

/* ─── Custom Horizontal Scrollbar ─── */
const HorizontalScrollbar = ({ scaledW, workspaceW, panX, setPan, panY, isDark, showVScrollbar }: {
    scaledW: number;
    workspaceW: number;
    panX: number;
    setPan: (x: number, y: number) => void;
    panY: number;
    isDark: boolean;
    showVScrollbar: boolean;
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const startXRef = useRef(0);
    const startPanXRef = useRef(0);

    const overflow  = scaledW - workspaceW;
    // Track spans the full workspace width (minus the vertical scrollbar width if visible)
    const trackWidth  = workspaceW - (showVScrollbar ? 5 : 0);
    // Thumb travel range uses a small inner margin so thumb doesn't clip the corner
    const thumbMargin = 0;
    const travelWidth = trackWidth - thumbMargin * 2;
    const thumbWidth  = Math.max(40, (workspaceW / scaledW) * travelWidth);
    const maxPan      = overflow > 0 ? overflow / 2 + PAN_PADDING : 0;
    const thumbLeft   = thumbMargin + ((maxPan - panX) / (2 * maxPan)) * (travelWidth - thumbWidth);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        draggingRef.current = true;
        startXRef.current = e.clientX;
        startPanXRef.current = panX;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingRef.current) return;
        const dx = e.clientX - startXRef.current;
        const panDelta = (dx / (travelWidth - thumbWidth)) * (2 * maxPan);
        const newPanX = Math.max(-maxPan, Math.min(maxPan, startPanXRef.current - panDelta));
        setPan(newPanX, panY);
    };

    const handlePointerUp = () => { draggingRef.current = false; };

    return (
        <div
            ref={trackRef}
            className={`absolute bottom-0 left-0 z-10 bg-transparent`}
            style={{ width: trackWidth, height: 5 }}
        >
            <div
                className={`absolute top-0 rounded-full cursor-pointer transition-colors ${isDark ? 'bg-gray-400/60 hover:bg-gray-300/80' : 'bg-gray-400/60 hover:bg-gray-500/80'}`}
                style={{
                    width: thumbWidth,
                    height: '100%',
                    left: Math.max(thumbMargin, Math.min(trackWidth - thumbMargin - thumbWidth, thumbLeft)),
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            />
        </div>
    );
};

/* ─── Custom Vertical Scrollbar ─── */
const VerticalScrollbar = ({ scaledH, workspaceH, panY, setPan, panX, isDark, showHScrollbar }: {
    scaledH: number;
    workspaceH: number;
    panY: number;
    setPan: (x: number, y: number) => void;
    panX: number;
    isDark: boolean;
    showHScrollbar: boolean;
}) => {
    const draggingRef  = useRef(false);
    const startYRef    = useRef(0);
    const startPanYRef = useRef(0);

    const overflow     = scaledH - workspaceH;
    // Track spans the full workspace height (minus the horizontal scrollbar height if visible)
    const trackHeight  = workspaceH - (showHScrollbar ? 5 : 0);
    const thumbMargin  = 0;
    const travelHeight = trackHeight - thumbMargin * 2;
    const thumbHeight  = Math.max(40, (workspaceH / scaledH) * travelHeight);
    const maxPan       = overflow > 0 ? overflow / 2 + PAN_PADDING : 0;
    const thumbTop     = thumbMargin + ((maxPan - panY) / (2 * maxPan)) * (travelHeight - thumbHeight);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        draggingRef.current = true;
        startYRef.current = e.clientY;
        startPanYRef.current = panY;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingRef.current) return;
        const dy = e.clientY - startYRef.current;
        const panDelta = (dy / (travelHeight - thumbHeight)) * (2 * maxPan);
        const newPanY = Math.max(-maxPan, Math.min(maxPan, startPanYRef.current - panDelta));
        setPan(panX, newPanY);
    };

    const handlePointerUp = () => { draggingRef.current = false; };

    return (
        <div
            className={`absolute right-0 top-0 z-10 bg-transparent`}
            style={{ width: 5, height: trackHeight }}
        >
            <div
                className={`absolute left-0 rounded-full cursor-pointer transition-colors ${isDark ? 'bg-gray-400/60 hover:bg-gray-300/80' : 'bg-gray-400/60 hover:bg-gray-500/80'}`}
                style={{
                    height: thumbHeight,
                    width: '100%',
                    top: Math.max(thumbMargin, Math.min(trackHeight - thumbMargin - thumbHeight, thumbTop)),
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            />
        </div>
    );
};

const SaasVideoEditor = () => {
    const { projectId } = useParams();
    const [isProjectLoading, setIsProjectLoading] = useState(true);

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

    // ─── Canvas store — granular selectors ───────────────────────────────────
    // FIX: We subscribe ONLY to elementIds (an array of strings) and the
    // stable action references.  We do NOT subscribe to the `elements` Record
    // here.  Because actions are functions defined once at store creation, their
    // references never change — Zustand skips re-renders for those selectors
    // entirely.  `elementIds` only changes when elements are added/removed,
    // NOT when an individual element's x/y/etc. is updated during drag.
    // This eliminates the full SaasVideoEditor re-render on every mouse-move.
    const elementIds = useEditorStore((s) => s.elementIds);
    const addElement = useEditorStore((s) => s.addElement);
    const updateElement = useEditorStore((s) => s.updateElement);
    const reorderElements = useEditorStore((s) => s.reorderElements);
    const removeElement = useEditorStore((s) => s.removeElement);
    // The Layers panel (Position tab) needs the full elements map, but ONLY
    // while the Position tab is open. We keep a separate subscription for it
    // so the canvas map() loop is never affected.
    const layersElements = useEditorStore((s) =>
        activeTab === 'Position' && positionSubTab === 'Layers' ? s.elements : null
    );
    const {
        selectedId, setSelectedId,
        isPlaying, setIsPlaying,
        currentTime, setCurrentTime,
        canvasFormat, setCanvasFormat,
        zoom, panX, panY, setZoom, setPan,
        zoomTarget, setZoomTarget
    } = useUIStore();

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) return;
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single();

                if (error) throw error;

                setCanvasFormat({
                    width: data.width,
                    height: data.height,
                    ratio: data.aspect_ratio
                });
                // TODO: Load elements and scenes into useEditorStore here later
            } catch (err) {
                console.error("Failed to load project:", err);
            } finally {
                setIsProjectLoading(false);
            }
        };

        fetchProject();
    }, [projectId, setCanvasFormat]);

    useEffect(() => {
        if (selectedId) {
            // Check existence imperatively, not as dependency
            const exists = useEditorStore.getState().elements[selectedId] !== undefined;
            if (!exists) setSelectedId(null);
        }
    }, [selectedId, setSelectedId]);




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
    // FIX: activeDragItem and savedActiveTab are now refs, not state.
    // Changing them during drag no longer triggers a React re-render of SaasVideoEditor
    // (and by extension, VirtualizedGrid). Only onDrop fires setState.
    const activeDragItemRef = useRef<string | null>(null);
    const savedActiveTabRef = useRef<string | null>(null);
    const canvasRef             = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);
    // Derived drag state — kept as state only for UI that truly needs to react (e.g. cursor change)
    const [isDraggingElement, setIsDraggingElement] = useState(false);

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

    const stateRef = useRef({ activeTab });
    useEffect(() => {
        stateRef.current = { activeTab };
    }, [activeTab]);

    /* ─── Pragmatic Drag and Drop Monitor ─── */
    // FIX: onDragStart now writes to REFS only (zero setState = zero re-renders during drag).
    // Only onDrop fires setState (addElement) — exactly ONE update at the end.
    useEffect(() => {
        return monitorForElements({
            onDragStart({ source }) {
                const type = source.data.type as string;
                if (!type) return;

                // Write to refs — NO React state update, NO re-render
                activeDragItemRef.current = `sidebar-${type}`;
                savedActiveTabRef.current = stateRef.current.activeTab;
                // setActiveTab(null) was the main offender — now deferred to a microtask
                // so the drag ghost renders first, then the panel collapses
                Promise.resolve().then(() => {
                    setIsDraggingElement(true);
                    setActiveTab(null);
                });
            },
            onDrop({ source, location }) {
                activeDragItemRef.current = null;
                setIsDraggingElement(false);

                const dropTargets = location.current.dropTargets;
                const hitCanvas = dropTargets.some((target: any) => target.data.id === 'canvas-dropzone');

                if (!hitCanvas || !canvasRef.current) {
                    setActiveTab(savedActiveTabRef.current);
                    return;
                }

                const type = source.data.type as string;
                if (!type) return;

                const canvasRect = canvasRef.current.getBoundingClientRect();
                const clientX = location.current.input.clientX;
                const clientY = location.current.input.clientY;

                // Divide by zoom so drop position maps to canvas-local coordinates
                const currentZoom = useUIStore.getState().zoom;
                const dropX = (clientX - canvasRect.left) / currentZoom;
                const dropY = (clientY - canvasRect.top) / currentZoom;

                const panelDef = PANEL_ELEMENTS.find((el: any) => el.type === type);
                const resolvedBoundingSize: [number, number] =
                    (source.data.boundingSize as [number, number]) ??
                    panelDef?.boundingSize ??
                    [200, 80];

                // This is the ONLY Zustand update during the entire drag lifecycle
                addElement({
                    id: Date.now().toString(),
                    type: type as any,
                    x: dropX - resolvedBoundingSize[0] / 2,
                    y: dropY - resolvedBoundingSize[1] / 2,
                    width: resolvedBoundingSize[0],
                    height: resolvedBoundingSize[1],
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    opacity: 1,
                    parentId: null,
                    animations: [],
                    boundingSize: resolvedBoundingSize,
                    props: panelDef?.defaultProps ?? {},
                });

                getHistoryControls().archive();
            }
        });
    }, [addElement]);

    // ─── Workspace size tracking (for scrollbar calculations) ────────────────
    const [workspaceSize, setWorkspaceSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const el = workspaceRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setWorkspaceSize({ width, height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // ─── Auto-Fit Canvas on Load (Industry Standard) ─────────────────────────
    const [hasInitialFit, setHasInitialFit] = useState(false);
    useEffect(() => {
        // Only run once when we have both the canvas dimensions and the workspace container size
        if (hasInitialFit || !canvasFormat || workspaceSize.width === 0 || workspaceSize.height === 0) return;

        // The Bounding Box Scaling Algorithm (Math.min)
        // 1. Calculate the scale factor needed to fit the width
        const scaleX = workspaceSize.width / canvasFormat.width;
        // 2. Calculate the scale factor needed to fit the height
        const scaleY = workspaceSize.height / canvasFormat.height;
        
        // 3. Take the absolute minimum of the two to guarantee it fits without scrollbars.
        // Multiply by 0.95 to provide a tighter 5% breathing room (padding) around the canvas.
        const fitZoom = Math.min(scaleX, scaleY) * 0.95;
        
        // Apply the exact calculated percentage
        setZoom(fitZoom);
        
        // Reset pan to perfectly center the canvas
        setPan(0, 0);

        // Mark as fitted so we don't accidentally override the user if they manually zoom later
        setHasInitialFit(true);
    }, [canvasFormat, workspaceSize, hasInitialFit, setZoom, setPan]);

    // ─── Wheel handler: ctrl/meta + wheel = zoom, plain wheel = vertical pan ─
    // IMPORTANT: Must use native addEventListener with { passive: false }.
    // React registers onWheel as passive in Chrome 73+, which silently
    // ignores preventDefault() — causing browser zoom to fire simultaneously.
    //
    // Refs for values the wheel handler needs without creating stale closures.
    // The handler is created once; these refs always hold the latest values.
    const workspaceSizeRef = useRef(workspaceSize);
    const canvasFormatRef = useRef(canvasFormat);
    useEffect(() => { workspaceSizeRef.current = workspaceSize; }, [workspaceSize]);
    useEffect(() => { canvasFormatRef.current = canvasFormat; }, [canvasFormat]);

    useEffect(() => {
        const el = workspaceRef.current;
        if (!el) return;


        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Normalize deltaY across input modes so our speed curve is consistent:
            // deltaMode=0 (pixel) — raw value, typical for trackpad pinch
            // deltaMode=1 (line)  — multiply by 15px/line (CSS default line height)
            // deltaMode=2 (page)  — multiply by 400px/page
            const normalizedDelta =
                e.deltaMode === 1 ? e.deltaY * 15 :
                    e.deltaMode === 2 ? e.deltaY * 400 :
                        e.deltaY;

            // Read fresh values from refs — no stale closures, always current
            const ws = workspaceSizeRef.current;
            const fmt = canvasFormatRef.current;
            const cW = fmt?.width ?? 1920;
            const cH = fmt?.height ?? 1080;

            if (e.ctrlKey || e.metaKey) {
                // ── Zoom ────────────────────────────────────────────────────────
                // JITTER FIX: deadzone — when pinch ends, deltaY oscillates around
                // 0 (0.00, -0.00, 0.01). Without a deadzone, the sign flips every
                // tick and zoom bounces back/forth → visible jitter. Skip noise.
                if (Math.abs(normalizedDelta) < 0.5) return;

                // SPEED FIX: scale factor by normalizedDelta magnitude.
                // Gentle pinch (|delta|<3px) = ~3%, hard scroll (|delta|≥50px) = ~7%.
                const absDelta = Math.abs(normalizedDelta);
                const speed = Math.min(absDelta / 50, 1); // 0–1 range
                const baseFactor = 1.03 + speed * 0.04;        // 1.03 → 1.07
                const factor = normalizedDelta < 0 ? baseFactor : 1 / baseFactor;

                const { zoom: z } = useUIStore.getState();
                const newZoom = Math.min(5, Math.max(0.1, z * factor));
                setZoom(newZoom);

                // Re-clamp pan to new zoom bounds
                const { panX: px, panY: py } = useUIStore.getState();
                const overflowXz = cW * newZoom - ws.width;
                const overflowYz = cH * newZoom - ws.height;
                const maxPanX = overflowXz > 0 ? overflowXz / 2 + PAN_PADDING : 0;
                const maxPanY = overflowYz > 0 ? overflowYz / 2 + PAN_PADDING : 0;
                setPan(
                    Math.max(-maxPanX, Math.min(maxPanX, px)),
                    Math.max(-maxPanY, Math.min(maxPanY, py))
                );
            } else {
                // ── Pan ─────────────────────────────────────────────────────────
                const { panX: px, panY: py, zoom: z } = useUIStore.getState();
                const overflowX = cW * z - ws.width;
                const overflowY = cH * z - ws.height;
                const maxPanX = overflowX > 0 ? overflowX / 2 + PAN_PADDING : 0;
                const maxPanY = overflowY > 0 ? overflowY / 2 + PAN_PADDING : 0;
                const newPanX = Math.max(-maxPanX, Math.min(maxPanX, px - e.deltaX));
                const newPanY = Math.max(-maxPanY, Math.min(maxPanY, py - normalizedDelta));
                setPan(newPanX, newPanY);
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [setZoom, setPan]);

    // Canvas pixel dimensions from format
    const canvasW = canvasFormat?.width ?? 1920;
    const canvasH = canvasFormat?.height ?? 1080;
    const scaledW = canvasW * zoom;
    const scaledH = canvasH * zoom;
    const showHScrollbar = scaledW > workspaceSize.width;
    const showVScrollbar = scaledH > workspaceSize.height;

    // ─── Clamp pan whenever zoom or workspace size changes (slider zoom path) ──
    // When zooming out via slider, the canvas may now fit inside the workspace,
    // so maxPan becomes 0 and pan must be clamped to 0 (centered). Canva-style.
    useEffect(() => {
        const overflowX = canvasW * zoom - workspaceSize.width;
        const overflowY = canvasH * zoom - workspaceSize.height;
        const maxPanX = overflowX > 0 ? overflowX / 2 + PAN_PADDING : 0;
        const maxPanY = overflowY > 0 ? overflowY / 2 + PAN_PADDING : 0;
        const { panX: px, panY: py } = useUIStore.getState();
        const clampedX = Math.max(-maxPanX, Math.min(maxPanX, px));
        const clampedY = Math.max(-maxPanY, Math.min(maxPanY, py));
        if (clampedX !== px || clampedY !== py) {
            setPan(clampedX, clampedY);
        }
    }, [zoom, workspaceSize, canvasW, canvasH, setPan]);

    return (
        <div className={`fixed inset-0 flex flex-col p-[10px] gap-[10px] overflow-hidden transition-colors duration-200 ${isDark ? 'dark bg-[#080810] text-white' : 'bg-[#f3f4f6] text-gray-900'}`}>

            {/* 2. Top navigation bar */}
            <div className={`h-[56px] rounded-b-xl shadow-sm flex-shrink-0 flex items-center justify-between px-4 z-[60] transition-colors duration-200 overflow-hidden -mx-[10px] -mt-[10px] ${isDark ? 'bg-[#1e2235] border-b border-[#2a2d45]' : 'bg-white border-b border-gray-200'}`}>

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
                    <div className={`w-[52px] flex-shrink-0 ${toolbarShouldCenter ? 'self-center' : ''} flex flex-col items-center gap-3 pt-3 pb-3 z-50 rounded-r-xl overflow-hidden shadow-sm transition-colors duration-200 -ml-[10px] ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-transparent'}`}>
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        const newTab = isActive ? null : tab.id;
                                        setActiveTab(newTab);
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
                        className={`absolute top-0 left-[62px] bottom-0 rounded-xl overflow-hidden z-[45] flex flex-col transition-all duration-300 ease-in-out ${activeTab ? 'translate-x-0 shadow-xl opacity-100' : '-translate-x-12 opacity-0 pointer-events-none'
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
                                                            x: 400 - 280 / 2,
                                                            y: 225 - 180 / 2,
                                                            width: 280,
                                                            height: 180,
                                                            rotation: 0,
                                                            scaleX: 1,
                                                            scaleY: 1,
                                                            opacity: 1,
                                                            parentId: null,
                                                            animations: [],
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
                                            items={positionSubTab === 'Arrange' ? flatPositions : [...Object.values(layersElements ?? useEditorStore.getState().elements).reverse(), { id: 'canvas-background', type: 'background', label: 'Background' }]}
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
                                                // Imperative read — no subscription needed for a one-shot click handler
                                                const total = useEditorStore.getState().elementIds.length;
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
                                            renderItem={(el: any, _index: number) => positionSubTab === 'Arrange' ? (
                                                <div
                                                    onClick={() => {
                                                        if (selectedId && canvasRef.current) {
                                                            const rect = canvasRef.current.getBoundingClientRect();
                                                            // Imperative read — fires on click, not during drag. No subscription needed.
                                                            const targetEl = useEditorStore.getState().elements[selectedId];
                                                            const [baseW, baseH] = targetEl?.boundingSize ?? [200, 60];
                                                            updateElement(selectedId, {
                                                                x: (el.x / 100) * rect.width - baseW / 2,
                                                                y: (el.y / 100) * rect.height - baseH / 2,
                                                                rotation: 0,
                                                                scaleX: 1,
                                                                scaleY: 1,
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
                                                        {(() => {
                                                            const ElementComponent = getElementComponent(el.type) as unknown as React.ElementType<any>;
                                                            if (!ElementComponent) return null;

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
                                    ) : activeTab === 'Animations' ? (
                                        <UniversalPanel
                                            title="Animations"
                                            onClose={() => { setActiveTab(null); }}
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
                                    ) : (
                                        <div className={`text-sm font-medium px-4 pt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {activeTab} content here
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ─── Canvas Workspace ─── */}
                    <div
                        ref={workspaceRef}
                        className="flex-1 min-w-0 min-h-0 relative z-0"
                        style={{ overflow: 'hidden' }}
                    >
                        {isProjectLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                <div className="w-8 h-8 border-4 border-t-[#7c3aed] border-[#e2e8f0] rounded-full animate-spin mb-4"></div>
                                Loading project...
                            </div>
                        ) : (
                            <>
                                <CanvasDropZone
                                    canvasRef={canvasRef}
                                    isDark={isDark}
                                    setSelectedId={setSelectedId}
                                    className="overflow-hidden"
                                    style={{
                                        position: 'absolute',
                                        width: canvasW,
                                        height: canvasH,
                                        left: '50%',
                                        top: '50%',
                                        // NO transition here — transition on transform causes GPU
                                        // subpixel blur on every wheel tick. At 60fps the steps
                                        // are already smooth without it.
                                        transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom})`,
                                        transformOrigin: '50% 50%',
                                        zIndex: 1,
                                    }}
                                >
                                    <div
                                        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
                                        onClick={(e) => {
                                            if (e.target === e.currentTarget) setSelectedId(null);
                                        }}
                                    >
                                        {/* FIX: Pass only primitive props (id, zIndex) so React.memo's
                                             Object.is check can actually bail out for unchanged elements.
                                             SceneElement reads its own data from the store internally. */}
                                        {elementIds.map((id, idx) => (
                                            <SceneElement
                                                key={id}
                                                id={id}
                                                zIndex={idx + 1}
                                                isDark={isDark}
                                                isSelected={id === selectedId}
                                                zoom={zoom}
                                                updateElement={updateElement}
                                                setSelectedId={setSelectedId}
                                                containerRef={canvasRef}
                                            />
                                        ))}
                                    </div>
                                </CanvasDropZone>



                                {/* ─── Custom Horizontal Scrollbar ─── */}
                                {showHScrollbar && (
                                    <HorizontalScrollbar
                                        scaledW={scaledW}
                                        workspaceW={workspaceSize.width}
                                        panX={panX}
                                        setPan={setPan}
                                        panY={panY}
                                        isDark={isDark}
                                        showVScrollbar={showVScrollbar}
                                    />
                                )}

                                {/* ─── Custom Vertical Scrollbar ─── */}
                                {showVScrollbar && (
                                    <VerticalScrollbar
                                        scaledH={scaledH}
                                        workspaceH={workspaceSize.height}
                                        panY={panY}
                                        setPan={setPan}
                                        panX={panX}
                                        isDark={isDark}
                                        showHScrollbar={showHScrollbar}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* 6. Main Right static panel */}
                    <div className={`w-[280px] p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto rounded-l-xl shadow-sm transition-colors duration-200 z-10 relative -mr-[10px] ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-transparent'}`}>
                        <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Properties
                        </span>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Select an element to view its properties.
                        </div>
                    </div>
                </div>

                {/* 7. Bottom bar (Timeline) */}
                <Timeline
                    currentTime={currentTime}
                    setCurrentTime={setCurrentTime}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    isDark={isDark}
                    onOpenMediaPanel={() => setActiveTab('Media')}
                    canvasZoom={zoom}
                    setCanvasZoom={setZoom}
                    zoomTarget={zoomTarget}
                    setZoomTarget={setZoomTarget}
                />

            </div>
        </div>
    );
};

export default SaasVideoEditor;
