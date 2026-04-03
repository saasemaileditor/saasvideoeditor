import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { CanvaBoundingBox } from '../components/CanvaBoundingBox';
import { useEditorStore, useUIStore, getHistoryControls } from '../store/useEditorStore';

import {
    DndContext,
    DragOverlay,
    useDroppable,
    useDraggable,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    Undo2, Redo2, Play, Pause, Download,
    Layers, Video, Sparkles, LayoutTemplate,
    X, Settings as SettingsIcon, Sun, Moon, Monitor, Plus, Type, Square,
    Maximize2, Minimize2, LayoutGrid, Grid3X3, Rows2, ChevronDown, Move, Smartphone, Hash, Search,
    Box, PieChart, AppWindow, MousePointer2, Smile, Triangle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

const AnimationCard = ({ preset, isDark, isSelected, onSelect, layout }: {
    preset: typeof ANIMATION_PRESETS[0];
    isDark: boolean;
    isSelected: boolean;
    onSelect: () => void;
    layout: 'list' | 'grid' | 'small-grid';
}) => {
    const [key, setKey] = useState(0);
    const replay = () => setKey(k => k + 1);

    return (
        <button
            onClick={() => { onSelect(); replay(); }}
            onMouseEnter={replay}
            className={`relative w-full flex border transition-all cursor-pointer ${layout === 'list' ? 'flex-row items-center gap-3 px-3 py-2.5 text-left' : 'flex-col items-center justify-center p-3 gap-2 text-center'
                } rounded-xl ${isSelected
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
                <span className={`${layout === 'list' ? 'ml-auto' : 'absolute top-1.5 right-1.5'} text-[10px] font-bold text-[#7c3aed] uppercase tracking-wide`}>
                    {layout === 'list' ? 'Applied' : '✓'}
                </span>
            )}
        </button>
    );
};

/* ─── Element catalogue (id ↔ icon ↔ label) ─── */
const ELEMENT_CATALOGUE: { id: string; icon: LucideIcon; label: string }[] = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'device', icon: Smartphone, label: 'Device' },
    { id: 'counter', icon: Hash, label: 'Counter' },
    { id: '3d', icon: Box, label: '3D' },
    { id: 'chart', icon: PieChart, label: 'Charts' },
    { id: 'card', icon: AppWindow, label: 'Cards' },
    { id: 'button', icon: MousePointer2, label: 'Buttons' },
    { id: 'icon', icon: Smile, label: 'Icons' },
    { id: 'shape', icon: Triangle, label: 'Shapes' },
];

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
            className={`relative aspect-square w-full max-h-[140px] hover:cursor-grab group touch-none ${isDragging ? 'opacity-40' : ''
                }`}
        >
            {/* The Back Card */}
            <div className={`absolute inset-0 rounded-xl transition-transform duration-300 transform translate-x-1.5 translate-y-1.5 rotate-3 group-hover:translate-x-2.5 group-hover:translate-y-2.5 group-hover:rotate-6 ${isDark ? 'bg-[#2a2d45] border border-[#1e2235]' : 'bg-[#f0f0f5] border border-gray-200'}`} />

            {/* The Front Card */}
            <div className={`relative w-full h-full flex flex-col items-center justify-center gap-2.5 border rounded-xl z-10 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:-translate-x-1 ${isDark
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

const SaasVideoEditor = () => {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);
    const [panelLayout, setPanelLayout] = useState<'list' | 'grid' | 'small-grid'>('list');
    const [isLayoutDropdownOpen, setIsLayoutDropdownOpen] = useState(false);

    // Canvas States (global store)
    const { elements, elementIds, addElement, updateElement, removeElement } = useEditorStore();
    const { selectedId, setSelectedId } = useUIStore();

    useEffect(() => {
        if (selectedId) {
            // Check existence imperatively, not as dependency
            const exists = useEditorStore.getState().elements.has(selectedId);
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
    const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(true);

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

    // Timeline States
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeScene, setActiveScene] = useState(1);
    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

    const timelineRef = useRef<HTMLDivElement>(null);

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



    // Playhead dragging logic
    const handleTimelineMouseDown = (e: React.MouseEvent) => {
        setIsDraggingPlayhead(true);
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percentage = x / rect.width;
            setCurrentTime(percentage * 10);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingPlayhead && timelineRef.current) {
                const rect = timelineRef.current.getBoundingClientRect();
                let x = e.clientX - rect.left;
                x = Math.max(0, Math.min(x, rect.width));
                const percentage = x / rect.width;
                setCurrentTime(percentage * 10);
            }
        };
        const handleMouseUp = () => setIsDraggingPlayhead(false);

        if (isDraggingPlayhead) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingPlayhead]);

    // Simulated Playback Logic
    useEffect(() => {
        let interval: number;
        if (isPlaying) {
            interval = window.setInterval(() => {
                setCurrentTime((prev) => {
                    if (prev >= 10) {
                        setIsPlaying(false);
                        return 10;
                    }
                    return prev + 0.1;
                });
            }, 100);
        }
        return () => window.clearInterval(interval);
    }, [isPlaying]);

    /* ─── @dnd-kit handlers ─── */
    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragItem(event.active.id as string);
        setSavedActiveTab(activeTab);
        // Always slide the panel away so the canvas drop-zone is fully visible
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

        // Cancel case: dropped outside the canvas — restore the panel that was open
        if (over?.id !== 'canvas-dropzone') {
            setActiveTab(savedActiveTab);
            return;
        }

        const type = active.data.current?.type as string | undefined;
        if (!type || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();

        // Use the ACTUAL pointer position (tracked via window pointermove) rather than
        // active.rect.current.translated which references the original sidebar card DOM node
        // and can be far off-screen when the overlay has drifted a long distance from it.
        const { x: clientX, y: clientY } = pointerRef.current;

        // Pixel offset of the pointer inside the canvas element
        const dropX = clientX - canvasRect.left;
        const dropY = clientY - canvasRect.top;

        // Convert to NDC (-1 → +1)
        const ndcX = (dropX / canvasRect.width) * 2 - 1;
        const ndcY = -((dropY / canvasRect.height) * 2 - 1);

        // Map NDC to orthographic world space (camera.zoom = 100)
        const worldX = (ndcX * canvasRect.width) / (2 * 100);
        const worldY = (ndcY * canvasRect.height) / (2 * 100);

        // Per-type bounding sizes (world units before scale).
        // 'text' omits boundingSize so CanvaBoundingBox falls back to its [3, 0.4] default.
        const BOUNDING_SIZES: Record<string, [number, number]> = {
            device: [1.8, 3.6],
            card: [2.4, 1.4],
            chart: [2.8, 2.0],
        };

        addElement({
            id: Date.now().toString(),
            type: type as 'text' | 'device' | 'card' | '3d' | 'chart' | 'counter' | 'button' | 'icon' | 'shape',
            position: [worldX, worldY, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            content: type === 'text' ? 'Edit this text' : undefined,
            ...(BOUNDING_SIZES[type] ? { boundingSize: BOUNDING_SIZES[type] } : {}),
        });

        // Archive ONE history checkpoint for the entire drop operation
        getHistoryControls().archive();
        window.dispatchEvent(new CustomEvent('history-updated'));

        // Panel stays closed after drop (original behavior)
    }, [addElement, savedActiveTab]);

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                                            setActiveTab(isActive ? null : tab.id);
                                            if (!isActive) setIsPanelExpanded(defaultPanelExpanded);
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
                            style={{ width: isPanelExpanded ? '480px' : '280px' }}
                        >
                            {activeTab && (
                                <>
                                    <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                                        <span className={`font-bold text-[16px] ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {TABS.find(t => t.id === activeTab)?.label}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {activeTab !== 'Position' && (
                                                <button
                                                    onClick={() => setIsPanelExpanded(e => !e)}
                                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                                    title={isPanelExpanded ? 'Collapse panel' : 'Expand panel'}
                                                >
                                                    {isPanelExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setActiveTab(null); setIsPanelExpanded(false); }}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                                title="Close panel"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {activeTab === 'Elements' && (
                                        <div className="px-4 pb-3 flex-shrink-0">
                                            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${isDark ? 'bg-[#161625] border-[#2a2d45] focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]/50' : 'bg-gray-50 border-gray-200 focus-within:border-[#7c3aed] focus-within:ring-1 focus-within:ring-[#7c3aed]/50'
                                                }`}>
                                                <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                                <input
                                                    type="text"
                                                    placeholder="Search elements..."
                                                    className={`flex-1 bg-transparent border-none outline-none text-sm font-medium w-full ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-y-auto p-3 pt-0">
                                        {activeTab === 'Elements' ? (
                                            <div className="flex flex-col gap-3 mt-1">
                                                <span className={`text-sm font-semibold px-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                    Browse categories
                                                </span>
                                                <div className={`grid gap-4 pt-2 ${isPanelExpanded ? 'grid-cols-4' : 'grid-cols-2'}`}>
                                                    {ELEMENT_CATALOGUE.map((el) => (
                                                        <DraggableCard
                                                            key={el.id}
                                                            elementId={el.id}
                                                            icon={el.icon}
                                                            label={el.label}
                                                            isDark={isDark}
                                                        />
                                                    ))}

                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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

                            <Canvas
                                style={{ width: '100%', height: '100%' }}
                                orthographic
                                camera={{ zoom: 100, position: [0, 0, 10] }}
                                onPointerMissed={() => setSelectedId(null)}
                            >
                                <ambientLight intensity={0.5} />
                                <directionalLight position={[10, 10, 10]} />
                                {elementIds.map(id => {
                                    const el = elements.get(id);
                                    if (!el) return null;
                                    const isSelected = el.id === selectedId;

                                    return (
                                        <group key={el.id}>
                                            {/* The actual text element */}
                                            <Text
                                                position={el.position}
                                                scale={el.scale}
                                                fontSize={0.24}
                                                color={isDark ? '#ffffff' : '#000000'}
                                                anchorX="left"
                                                anchorY="top"
                                                maxWidth={3}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedId(el.id);
                                                }}
                                            >
                                                {el.content ?? ''}
                                            </Text>

                                            {/* Canva-style 2-D bounding box shown only when selected */}
                                            {isSelected && (
                                                <CanvaBoundingBox
                                                    el={el}
                                                    updateElement={updateElement}
                                                />
                                            )}
                                        </group>
                                    );
                                })}
                            </Canvas>
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
                            style={{ width: isRightPanelExpanded ? '480px' : '280px' }}
                        >
                            <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${isDark ? 'border-[#2a2d45]' : 'border-gray-100'}`}>
                                <span className={`font-bold text-[16px] ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Animations
                                </span>
                                <div className="flex items-center gap-1">
                                    <div className="relative z-50 mr-1">
                                        <button
                                            onClick={() => setIsLayoutDropdownOpen(!isLayoutDropdownOpen)}
                                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-sm font-medium cursor-pointer transition-colors ${isDark ? 'border-[#2a2d45] bg-[#1e2235] text-gray-300 hover:bg-[#252840]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {panelLayout === 'list' ? <Rows2 size={16} /> : panelLayout === 'grid' ? <LayoutGrid size={16} /> : <Grid3X3 size={16} />}
                                            <ChevronDown size={14} />
                                        </button>

                                        {isLayoutDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-[110]" onClick={() => setIsLayoutDropdownOpen(false)} />
                                                <div className={`absolute top-full right-0 mt-1 p-1 w-32 rounded-lg shadow-xl border z-[120] flex flex-col ${isDark ? 'bg-[#1e2235] border-[#2a2d45]' : 'bg-white border-gray-100'
                                                    }`}>
                                                    {[
                                                        { id: 'list', icon: Rows2, label: 'List' },
                                                        { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                                                        { id: 'small-grid', icon: Grid3X3, label: 'Small Grid' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => { setPanelLayout(opt.id as any); setIsLayoutDropdownOpen(false); }}
                                                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${panelLayout === opt.id
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
                                    <button
                                        onClick={() => setIsRightPanelExpanded(e => !e)}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                        title={isRightPanelExpanded ? 'Collapse panel' : 'Expand panel'}
                                    >
                                        {isRightPanelExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                    </button>
                                    <button
                                        onClick={() => setIsRightPanelAnimationOpen(false)}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                        title="Close panel"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3">
                                <div className="flex flex-col">
                                    <p className={`text-[11px] px-1 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Hover or click to preview. Click to apply.
                                    </p>

                                    <div className={
                                        panelLayout === 'list' ? "flex flex-col gap-2" :
                                            panelLayout === 'grid' ? "grid grid-cols-2 gap-2" :
                                                "grid grid-cols-3 gap-2"
                                    }>
                                        {ANIMATION_PRESETS.map(preset => (
                                            <AnimationCard
                                                key={preset.id}
                                                preset={preset}
                                                isDark={isDark}
                                                isSelected={false}
                                                onSelect={() => { }}
                                                layout={panelLayout}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Main Right static panel */}
                        <div className={`w-[280px] p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto rounded-xl shadow-sm transition-colors duration-200 z-10 relative ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-transparent'}`}>
                            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Properties
                            </span>
                            <button
                                onClick={() => setIsRightPanelAnimationOpen(prev => !prev)}
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
                    <div className={`h-[200px] rounded-xl shadow-sm flex-shrink-0 flex flex-col transition-colors duration-200 overflow-hidden ${isDark ? 'bg-[#1e2235] border border-[#2a2d45]' : 'bg-white border border-gray-200'}`}>

                        {/* Scenes strip top section */}
                        <div className={`h-[44px] flex-shrink-0 flex items-center px-3 gap-2 border-b ${isDark ? 'border-gray-800 bg-[#2a2a3e]' : 'border-gray-200 bg-[#f8f8f8]'}`}>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center ${isDark ? 'text-[#7c3aed] hover:bg-gray-800' : 'text-[#7c3aed] hover:bg-gray-200'}`}
                            >
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            </button>
                            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            <span className={`font-mono text-xs font-medium w-[80px] text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {Math.floor(currentTime)}:{(Math.floor((currentTime % 1) * 100)).toString().padStart(2, '0')} / 0:10
                            </span>
                            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            <button className={`p-1 rounded-md transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                                <Plus size={16} />
                            </button>
                            <div className="flex gap-2 ml-1">
                                {[1, 2].map((sceneNum) => {
                                    const isActive = activeScene === sceneNum;
                                    return (
                                        <button
                                            key={sceneNum}
                                            onClick={() => setActiveScene(sceneNum)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${isActive
                                                ? 'bg-[#7c3aed] text-white'
                                                : isDark
                                                    ? 'border border-gray-700 text-gray-400 hover:bg-gray-800'
                                                    : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            Scene {sceneNum}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main Timeline Area */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* Left Column (Tracks) */}
                            <div className={`w-[140px] flex-shrink-0 flex flex-col border-r z-20 ${isDark ? 'border-gray-800 bg-[#1e1e2e]' : 'border-gray-200 bg-white'}`}>
                                <div className={`h-[24px] border-b flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}></div>

                                <div className={`h-[36px] flex items-center gap-2 px-3 text-xs font-medium ${isDark ? 'bg-[#1e1e2e] text-gray-300' : 'bg-white text-gray-600'}`}>
                                    <Type size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                    Text 1
                                </div>
                                <div className={`h-[36px] flex items-center gap-2 px-3 text-xs font-medium ${isDark ? 'bg-[#252538] text-gray-300' : 'bg-[#f9f9f9] text-gray-600'}`}>
                                    <Video size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                    Video 1
                                </div>
                                <div className={`h-[36px] flex items-center gap-2 px-3 text-xs font-medium ${isDark ? 'bg-[#1e1e2e] text-gray-300' : 'bg-white text-gray-600'}`}>
                                    <Square size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                    Card 1
                                </div>
                            </div>

                            {/* Right Side (Timeline scroll) */}
                            <div className={`flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar ${isDark ? 'bg-[#1a1a2e]' : 'bg-white'}`}>

                                <div
                                    className="min-w-[800px] h-full relative"
                                    ref={timelineRef}
                                    onMouseDown={handleTimelineMouseDown}
                                >
                                    {/* Playhead Marker */}
                                    <div
                                        className="absolute top-0 bottom-0 w-[2px] bg-[#7c3aed] z-30 pointer-events-none"
                                        style={{ left: `${(currentTime / 10) * 100}%` }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#7c3aed]" />
                                    </div>

                                    {/* Time Ruler */}
                                    <div className={`h-[24px] border-b flex relative pointer-events-none ${isDark ? 'bg-[#252538] border-gray-800' : 'bg-[#f3f4f6] border-gray-200'}`}>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sec) => (
                                            <div
                                                key={sec}
                                                className="absolute top-0 bottom-0 flex items-end pb-0.5 pointer-events-none"
                                                style={{ left: `${(sec / 10) * 100}%` }}
                                            >
                                                <span className={`text-[10px] font-medium select-none -translate-x-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {sec}s
                                                </span>
                                                <div className={`absolute bottom-0 w-px h-1 left-0 -translate-x-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Element Bars Area */}
                                    <div className="flex flex-col relative pointer-events-none">
                                        <div className="h-[36px] relative px-1">
                                            <div
                                                className="absolute rounded-full h-[20px] top-1/2 -translate-y-1/2 transition-all"
                                                style={{ left: '0%', width: '40%', backgroundColor: 'rgba(124, 58, 237, 0.8)' }}
                                            ></div>
                                        </div>

                                        <div className="h-[36px] relative px-1">
                                            <div
                                                className="absolute rounded-full h-[20px] top-1/2 -translate-y-1/2 transition-all"
                                                style={{ left: '20%', width: '70%', backgroundColor: 'rgba(59, 130, 246, 0.8)' }}
                                            ></div>
                                        </div>

                                        <div className="h-[36px] relative px-1">
                                            <div
                                                className="absolute rounded-full h-[20px] top-1/2 -translate-y-1/2 transition-all"
                                                style={{ left: '0%', width: '100%', backgroundColor: 'rgba(16, 185, 129, 0.8)' }}
                                            ></div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Drag overlay — renders the floating card while dragging */}
            <DragOverlay dropAnimation={null}>
                {activeDragItem != null && (() => {
                    const entry = ELEMENT_CATALOGUE.find(
                        (el) => `sidebar-${el.id}` === activeDragItem
                    );
                    return entry ? <DragOverlayCard icon={entry.icon} label={entry.label} /> : null;
                })()}
            </DragOverlay>
        </DndContext>
    );
};

export default SaasVideoEditor;
