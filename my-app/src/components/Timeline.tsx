import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Play, Pause, Plus, LayoutGrid, Music, Maximize, CloudUpload, RectangleHorizontal } from 'lucide-react';

interface TimelineProps {
    currentTime: number;
    setCurrentTime: (time: number | ((prev: number) => number)) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    isDark: boolean;
    onOpenMediaPanel: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_DURATION = 60;   // 1 minute default
const SEGMENT_SECONDS = 5;     // Each visual segment = 5 seconds
const SUB_TICKS_PER_SEGMENT = 5; // 5 sub-ticks per segment (1 per second)
const AUTO_EXTEND_SECONDS = 15; // Add 15s when auto-extending

export const Timeline = ({
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    isDark,
    onOpenMediaPanel,
}: TimelineProps) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
    };

    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const [zoom, setZoom] = useState(380); // 10 to 1000 zoom scale
    const [duration, setDuration] = useState(DEFAULT_DURATION); // Dynamic, auto-extending
    const timelineRef = useRef<HTMLDivElement>(null);
    // New state: scrubber follows resize handle and fades while dragging
    const [scrubberTime, setScrubberTime] = useState(currentTime);
    const [scrubberFaded, setScrubberFaded] = useState(false);

    const [containerWidth, setContainerWidth] = useState(0);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverScrubberPos, setHoverScrubberPos] = useState<{ top: number; left: number } | null>(null);
    const [showPlusDropdown, setShowPlusDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const [scenes, setScenes] = useState<{ id: string, duration: number, leadingGap?: number }[]>([]);
    const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
    const [resizingScene, setResizingScene] = useState<{
        id: string;
        side: 'left' | 'right';
        startX: number;
        startDuration: number;
        startLeadingGap: number;
    } | null>(null);
    const [resizeTooltip, setResizeTooltip] = useState<{ x: number; y: number } | null>(null);
    const [hoveredHandleSceneId, setHoveredHandleSceneId] = useState<string | null>(null);
    const plusBtnRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Refs for left-handle DOM-direct updates — no React re-renders during drag = zero shake
    const spacerRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const sceneRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const liveLeftDrag = useRef<{ sceneId: string | null; spacerPx: number; scenePx: number; duration: number }>(
        { sceneId: null, spacerPx: 0, scenePx: 0, duration: 0 }
    );
    const liveRightDrag = useRef<{ sceneId: string | null; scenePx: number; duration: number }>(
        { sceneId: null, scenePx: 0, duration: 0 }
    );

    // Compute dropdown position when it opens
    useEffect(() => {
        if (showPlusDropdown && plusBtnRef.current) {
            const rect = plusBtnRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.top - 8, // 8px gap above the button
                left: rect.left,
            });
        } else {
            setDropdownPos(null);
        }
    }, [showPlusDropdown]);

    // Close dropdown on click outside
    useEffect(() => {
        if (!showPlusDropdown) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                plusBtnRef.current && !plusBtnRef.current.contains(e.target as Node)
            ) {
                setShowPlusDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPlusDropdown]);

    // Track container width for pixel-perfect tick rounding
    useEffect(() => {
        if (!timelineRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        observer.observe(timelineRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-extend duration when currentTime approaches the end
    useEffect(() => {
        if (currentTime >= duration - 2) {
            setDuration((prev) => prev + AUTO_EXTEND_SECONDS);
        }
    }, [currentTime, duration]);

    // ─── Ruler tick generation ────────────────────────────────────────────────
    const rulerTicks = useMemo(() => {
        const totalSegments = Math.ceil(duration / SEGMENT_SECONDS);
        const ticks: { time: number; isMajor: boolean }[] = [];

        for (let seg = 0; seg <= totalSegments; seg++) {
            const majorTime = seg * SEGMENT_SECONDS;
            ticks.push({ time: majorTime, isMajor: true });

            // Sub-ticks within this segment (skip if last segment boundary)
            if (seg < totalSegments) {
                for (let sub = 1; sub < SUB_TICKS_PER_SEGMENT; sub++) {
                    const subTime = majorTime + sub * (SEGMENT_SECONDS / SUB_TICKS_PER_SEGMENT);
                    if (subTime <= duration) {
                        ticks.push({ time: subTime, isMajor: false });
                    }
                }
            }
        }
        return ticks;
    }, [duration]);

    // ─── Time ↔ pixel helpers ─────────────────────────────────────────────────
    const usableWidth = containerWidth - 8; // 4px padding each side
    const timeToPixel = (t: number) => Math.round((t / duration) * usableWidth);
    const pixelToTime = (px: number) => {
        const clamped = Math.max(0, Math.min(px, usableWidth));
        return (clamped / usableWidth) * duration;
    };

    const handleTimelineMouseMove = (e: React.MouseEvent) => {
        // Don't update hover state during an active resize drag
        if (resizingScene !== null) return;
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - 4;
            const time = pixelToTime(x);
            setHoverTime(time);

            setHoverScrubberPos({
                top: rect.top,
                left: rect.left + 4 + timeToPixel(time)
            });
        }
    };

    const handleTimelineMouseDown = (e: React.MouseEvent) => {
        setIsDraggingPlayhead(true);
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - 4;
            setCurrentTime(pixelToTime(x));
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingPlayhead && timelineRef.current) {
                const rect = timelineRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left - 4;
                setCurrentTime(pixelToTime(x));
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
    }, [isDraggingPlayhead, setCurrentTime, duration]);

    // Simulated Playback Logic
    useEffect(() => {
        let interval: number;
        if (isPlaying) {
            interval = window.setInterval(() => {
                setCurrentTime((prev) => {
                    if (prev >= duration) {
                        setIsPlaying(false);
                        return duration;
                    }
                    return prev + 0.1;
                });
            }, 100);
        }
        return () => window.clearInterval(interval);
    }, [isPlaying, setIsPlaying, setCurrentTime, duration]);

    // ─── Ruler label formatter (smart: shows m:ss for ≥60s) ──────────────────
    const formatRulerLabel = (seconds: number) => {
        if (seconds >= 60) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `${seconds}s`;
    };

    // ─── Scene Resize Handlers ────────────────────────────────────────────────
    const handleResizeStart = (
        e: React.MouseEvent,
        sceneId: string,
        side: 'left' | 'right',
        currentDuration: number
    ) => {
        e.stopPropagation();
        e.preventDefault();
        const scene = scenes.find(s => s.id === sceneId);
        setResizingScene({ id: sceneId, side, startX: e.clientX, startDuration: currentDuration, startLeadingGap: scene?.leadingGap || 0 });
        setResizeTooltip({ x: e.clientX, y: e.clientY });
        // Start fading the scrubber and set its initial position
        setScrubberFaded(true);
        // For right handle we start at the end of the scene, for left at the start
        const sceneStart = scenes.find(s => s.id === sceneId);
        const startTime = sceneStart ? (sceneStart.leadingGap || 0) + scenes.slice(0, scenes.findIndex(s => s.id === sceneId)).reduce((sum, s) => sum + s.duration, 0) : 0;
        const initialScrubber = side === 'right' ? startTime + currentDuration : startTime;
        setScrubberTime(initialScrubber);
    };

    useEffect(() => {
        if (!resizingScene) return;
        const pixelsPerSecond = usableWidth / duration;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - resizingScene.startX;

            if (resizingScene.side === 'right') {
                // Right handle: pure DOM update — same pattern as left, zero shake
                const startScenePx = Math.round(resizingScene.startDuration * pixelsPerSecond);
                const minScenePx = Math.round(0.3 * pixelsPerSecond);
                const newScenePx = Math.max(minScenePx, startScenePx + deltaX);

                liveRightDrag.current = {
                    sceneId: resizingScene.id,
                    scenePx: newScenePx,
                    duration: newScenePx / pixelsPerSecond,
                };

                const sceneEl = sceneRefs.current.get(resizingScene.id);
                if (sceneEl) sceneEl.style.width = newScenePx + 'px';
            } else {
                // Left handle: pure DOM update — zero shake.
                const startLeadingPx = Math.round(resizingScene.startLeadingGap * pixelsPerSecond);
                const startScenePx = Math.round(resizingScene.startDuration * pixelsPerSecond);
                const rightEdge = startLeadingPx + startScenePx;
                const minScenePx = Math.round(0.3 * pixelsPerSecond);

                let newSpacerPx = startLeadingPx + deltaX;
                let newScenePx;

                if (newSpacerPx < 0) {
                    // Spacer exhausted — scene EXPANDS freely to the right
                    newScenePx = startScenePx + Math.abs(newSpacerPx);
                    newSpacerPx = 0;
                } else {
                    // Collapsing: spacer grows, scene shrinks (right edge stays fixed)
                    newScenePx = rightEdge - newSpacerPx;
                    if (newScenePx < minScenePx) {
                        newScenePx = minScenePx;
                        newSpacerPx = rightEdge - minScenePx;
                    }
                }

                liveLeftDrag.current = {
                    sceneId: resizingScene.id,
                    spacerPx: newSpacerPx,
                    scenePx: newScenePx,
                    duration: newScenePx / pixelsPerSecond,
                };

                const spacerEl = spacerRefs.current.get(resizingScene.id);
                const sceneEl = sceneRefs.current.get(resizingScene.id);
                if (spacerEl) spacerEl.style.width = newSpacerPx + 'px';
                if (sceneEl) sceneEl.style.width = newScenePx + 'px';
            }

            // Small tooltip re-render; React reads liveLeftDrag.current for widths → no conflict
            setResizeTooltip(prev => prev ? { ...prev, x: e.clientX } : null);
        };

        const handleMouseUp = () => {
            if (resizingScene.side === 'right') {
                // Commit final right-handle duration from DOM to React state
                const finalDuration = liveRightDrag.current.sceneId === resizingScene.id
                    ? liveRightDrag.current.duration
                    : resizingScene.startDuration;
                // Update scenes with new duration
                setScenes(prev =>
                    prev.map(s => s.id === resizingScene.id
                        ? { ...s, duration: parseFloat(finalDuration.toFixed(2)) }
                        : s
                    )
                );
                // Calculate new right edge position for scrubber (sum of prior durations + new duration)
                const sceneIdx = scenes.findIndex(s => s.id === resizingScene.id);
                const priorDuration = scenes.slice(0, sceneIdx).reduce((sum, s) => sum + s.duration, 0);
                const newEdgePosition = priorDuration + parseFloat(finalDuration.toFixed(2));
                setScrubberTime(newEdgePosition);
                setCurrentTime(newEdgePosition);
                liveRightDrag.current = { sceneId: null, scenePx: 0, duration: 0 };
            } else {
                // Commit final left-handle duration, reset leadingGap to 0 — scenes snap back
                const finalDuration = liveLeftDrag.current.sceneId === resizingScene.id
                    ? liveLeftDrag.current.duration
                    : resizingScene.startDuration;
                setScenes(prev =>
                    prev.map(s => s.id === resizingScene.id
                        ? { ...s, duration: parseFloat(finalDuration.toFixed(2)), leadingGap: 0 }
                        : s
                    )
                );
                // Update scrubber position to the new start of the scene (left handle)
                const sceneIdx = scenes.findIndex(s => s.id === resizingScene.id);
                const priorDuration = scenes.slice(0, sceneIdx).reduce((sum, s) => sum + s.duration, 0);
                setScrubberTime(priorDuration);
                setCurrentTime(priorDuration);
                liveLeftDrag.current = { sceneId: null, spacerPx: 0, scenePx: 0, duration: 0 };
            }
            // End of resize: stop fading
            setScrubberFaded(false);
            setResizingScene(null);
            setResizeTooltip(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingScene, usableWidth, duration]);

    return (
        <>
            <div className={`h-[180px] pt-0 pb-2 flex-shrink-0 flex flex-col transition-colors duration-200 overflow-hidden -mx-[10px] -mb-[10px] ${isDark ? 'bg-[#1e1e2e] border-t border-[#2a2d45]' : 'bg-white border-t border-gray-200'}`}>


                {/* Main Timeline Area */}
                <div className="flex-1 flex overflow-hidden">
                    <div className={`flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar ${isDark ? 'bg-[#14141d]' : 'bg-white'}`}>
                        <div
                            className="h-full relative transition-all duration-300 ease-out px-1"
                            style={{ minWidth: `${800 + (zoom * 4)}px` }}
                            ref={timelineRef}
                            onMouseDown={handleTimelineMouseDown}
                            onMouseMove={handleTimelineMouseMove}
                            onMouseLeave={() => { setHoverTime(null); setHoverScrubberPos(null); }}
                        >
                            {/* Ghost Scrubber (Hover Preview) */}
                            {hoverTime !== null && !isDraggingPlayhead && hoveredHandleSceneId === null && resizingScene === null && (
                                <div className="absolute top-0 bottom-0 w-[2px] z-40 pointer-events-none left-1"
                                    style={{
                                        transform: `translateX(${timeToPixel(hoverTime)}px)`,
                                    }}
                                >
                                    <svg width="10" height="8" viewBox="0 0 10 8" className="absolute top-[2px] left-1/2 -translate-x-1/2 text-[#1f2937]" fill="currentColor">
                                        <path d="M2.5 1h5c1.1 0 1.6 1.3.8 2.1L5.8 5.7c-.4.4-1.1.4-1.5 0L1.7 3.1C.9 2.3 1.4 1 2.5 1z" />
                                    </svg>
                                    <div className="absolute top-[28px] bottom-0 left-0 right-0 bg-gray-800 opacity-60 rounded-full" />
                                </div>
                            )}

                            {/* Playhead Marker */}
                            <div className="absolute top-0 bottom-0 w-[2px] z-40 pointer-events-none left-1"
                                style={{
                                    transform: `translateX(${timeToPixel(scrubberFaded ? scrubberTime : currentTime)}px)`,
                                    opacity: scrubberFaded ? 0.5 : 1
                                }}
                            >
                                {/* Rounded Head triangle */}
                                <svg width="10" height="8" viewBox="0 0 10 8" className="absolute top-[2px] left-1/2 -translate-x-1/2 text-gray-800" fill="currentColor">
                                    <path d="M2.5 1h5c1.1 0 1.6 1.3.8 2.1L5.8 5.7c-.4.4-1.1.4-1.5 0L1.7 3.1C.9 2.3 1.4 1 2.5 1z" />
                                </svg>

                                {/* Scrubber line starting below major ticks */}
                                <div className="absolute top-[28px] bottom-0 left-0 right-0 bg-gray-800 rounded-full" />

                                <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                    {formatTime(scrubberFaded ? scrubberTime : currentTime)}
                                </div>
                            </div>

                            {/* Time Ruler */}
                            <div className="h-[36px] flex absolute inset-x-1 pointer-events-none z-10 pt-2">
                                {rulerTicks.map((tick) => (
                                    <div
                                        key={tick.time}
                                        className="absolute top-0 bottom-0 flex flex-row items-start pointer-events-none pt-2"
                                        style={{
                                            left: `${timeToPixel(tick.time)}px`
                                        }}
                                    >
                                        <div className={`w-[2px] rounded-full ${tick.isMajor ? 'h-5' : 'h-2.5'} ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                                        {tick.isMajor && (
                                            <span className={`text-[14px] font-medium select-none ml-1.5 whitespace-nowrap -mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatRulerLabel(tick.time)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Tracks Area Container (Below ruler) — vertical scroll only */}
                            <div className="absolute top-[30px] bottom-0 left-1 right-1 flex flex-col overflow-y-auto overflow-x-visible gap-[2px] py-0 custom-scrollbar">
                                {/* Row 1: Add Elements */}
                                <div className="relative h-9 shrink-0 flex items-center">
                                    <button className={`sticky left-0 z-15 flex items-center gap-2.5 px-4 py-1.5 rounded-[10px] text-[13px] font-semibold shadow-sm transition-colors ${isDark ? 'bg-[#1e1e2e] text-gray-300 hover:bg-gray-800' : 'bg-[#e5e7eb] text-gray-700 hover:bg-[#d1d5db]'}`}>
                                        <LayoutGrid size={15} />
                                        Add elements
                                    </button>
                                </div>

                                <div className="relative h-[62px] shrink-0 flex items-center">
                                    <div className={`absolute inset-y-0 left-0 right-4 rounded-xl flex items-center z-10 ${isDark ? 'bg-[#1e1e2e]' : 'bg-[#e5e7eb]'}`}>

                                        {scenes.map((scene) => {
                                            const isSelected = selectedSceneId === scene.id;
                                            // During left drag: use live ref values so React render matches DOM → no reconciler conflict
                                            const isLiveLeftDrag = liveLeftDrag.current.sceneId === scene.id;
                                            const isLiveRightDrag = liveRightDrag.current.sceneId === scene.id;
                                            const spacerPx = isLiveLeftDrag
                                                ? liveLeftDrag.current.spacerPx
                                                : Math.round((scene.leadingGap || 0) * (usableWidth / duration));
                                            const scenePx = isLiveLeftDrag
                                                ? liveLeftDrag.current.scenePx
                                                : isLiveRightDrag
                                                    ? liveRightDrag.current.scenePx
                                                    : timeToPixel(scene.duration);
                                            return (
                                                <React.Fragment key={scene.id}>
                                                    {/* Leading gap spacer — width set by DOM ref during drag, React state at rest */}
                                                    <div
                                                        ref={(el) => { spacerRefs.current.set(scene.id, el); }}
                                                        className="h-full flex-shrink-0 pointer-events-none"
                                                        style={{ width: `${spacerPx}px` }}
                                                    />
                                                    <div
                                                        ref={(el) => { sceneRefs.current.set(scene.id, el); }}
                                                        onClick={() => setSelectedSceneId(isSelected ? null : scene.id)}
                                                        className={`relative h-full bg-white rounded-md overflow-hidden flex items-end p-2 flex-shrink-0 cursor-pointer border-[1.5px] group/scene ${isSelected
                                                                ? 'border-[#7c3aed]'
                                                                : 'border-[#d1d5db]'
                                                            }`}
                                                        style={{ width: `${scenePx}px` }}
                                                    >
                                                        {/* Duration label:
                                                    - Not selected → never shows
                                                    - Selected + hovering handle zone → hidden (handles are visible instead)
                                                    - Selected + hovering anywhere else → visible
                                                    - During active resize → hidden (tooltip takes over)
                                                */}
                                                        {isSelected && resizingScene?.id !== scene.id && (
                                                            <span className={`text-[12.5px] font-bold text-[#1f2937] leading-none tracking-tight transition-opacity ${hoveredHandleSceneId === scene.id ? 'opacity-0' : 'opacity-100'
                                                                }`}>
                                                                {scene.duration.toFixed(1)}s
                                                            </span>
                                                        )}

                                                        {/* Unified resize handles: gradient shadow + white bar + resize logic — single element per side */}
                                                        <>
                                                            {/* Left: darker at left edge, fades inward to transparent */}
                                                            <div
                                                                className={`absolute left-0 top-0 bottom-0 w-[40px] flex items-center justify-start pl-[9px] cursor-ew-resize transition-opacity z-10 ${hoveredHandleSceneId === scene.id ? 'opacity-100' : 'opacity-0'
                                                                    }`}
                                                                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.07) 55%, transparent 100%)' }}
                                                                onMouseEnter={() => setHoveredHandleSceneId(scene.id)}
                                                                onMouseLeave={() => setHoveredHandleSceneId(null)}
                                                                onMouseDown={(e) => handleResizeStart(e, scene.id, 'left', scene.duration)}
                                                            >
                                                                <div className="w-[3px] h-[26px] bg-white rounded-full shadow-md flex-shrink-0" />
                                                            </div>
                                                            {/* Right: darker at right edge, fades inward to transparent */}
                                                            <div
                                                                className={`absolute right-0 top-0 bottom-0 w-[40px] flex items-center justify-end pr-[9px] cursor-ew-resize transition-opacity z-10 ${hoveredHandleSceneId === scene.id ? 'opacity-100' : 'opacity-0'
                                                                    }`}
                                                                style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.07) 55%, transparent 100%)' }}
                                                                onMouseEnter={() => setHoveredHandleSceneId(scene.id)}
                                                                onMouseLeave={() => setHoveredHandleSceneId(null)}
                                                                onMouseDown={(e) => handleResizeStart(e, scene.id, 'right', scene.duration)}
                                                            >
                                                                <div className="w-[3px] h-[26px] bg-white rounded-full shadow-md flex-shrink-0" />
                                                            </div>
                                                        </>

                                                        {/* 3-dot pill — only when selected AND hovered */}
                                                        {isSelected && (
                                                            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/scene:opacity-100 transition-opacity z-20">
                                                                <div
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="bg-[#6b7280] hover:bg-[#7c3aed] rounded-full px-[6px] py-[5px] flex items-center gap-[2.5px] transition-colors cursor-pointer"
                                                                >
                                                                    <span className="w-[3px] h-[3px] rounded-full bg-white block" />
                                                                    <span className="w-[3px] h-[3px] rounded-full bg-white block" />
                                                                    <span className="w-[3px] h-[3px] rounded-full bg-white block" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}

                                        <div className="sticky left-0 px-2 pl-2 flex items-center gap-3 h-full py-[8px] flex-shrink-0 ml-[2px]">
                                            <div className="relative h-full">
                                                <button
                                                    ref={plusBtnRef}
                                                    onClick={(e) => { e.stopPropagation(); setShowPlusDropdown(!showPlusDropdown); }}
                                                    className={`h-full aspect-square rounded-lg flex items-center justify-center shadow-sm cursor-pointer ${isDark ? 'bg-[#2a2d45] text-gray-300 hover:bg-[#323652]' : 'bg-[#d1d5db] text-gray-600 hover:bg-[#c2c6cc] transition-colors'}`}
                                                >
                                                    <Plus size={18} strokeWidth={2.5} />
                                                </button>

                                                {/* Plus Dropdown Menu — rendered via Portal to escape overflow clipping */}
                                            </div>
                                            {scenes.length === 0 && (
                                                <span className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>or drag and drop media</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Add Audio */}
                                <div className="relative h-9 shrink-0 flex items-center">
                                    <button className={`sticky left-0 z-15 flex items-center gap-2.5 px-4 py-1.5 rounded-[10px] text-[13px] font-semibold shadow-sm transition-colors ${isDark ? 'bg-[#1e1e2e] text-gray-300 hover:bg-gray-800' : 'bg-[#e5e7eb] text-gray-700 hover:bg-[#d1d5db]'}`}>
                                        <Music size={15} />
                                        Add audio
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="flex-shrink-0 flex items-center justify-end mt-1 pl-3 pr-3">

                    {/* Right Side: Canva style controls */}
                    <div className="flex items-center gap-4 text-xs font-medium">
                        {/* Zoom Slider */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center group">
                                <input
                                    type="range"
                                    min="10"
                                    max="1000"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseInt(e.target.value))}
                                    className={`w-48 h-1 rounded-full appearance-none cursor-pointer outline-none ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                                    style={{
                                        backgroundImage: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zoom / 1000) * 100}%, transparent ${(zoom / 1000) * 100}%, transparent 100%)`,
                                    }}
                                />
                                <style>{`
                                input[type='range']::-webkit-slider-thumb {
                                    -webkit-appearance: none;
                                    appearance: none;
                                    width: 10px;
                                    height: 10px;
                                    background: #3b82f6;
                                    border-radius: 50%;
                                    cursor: pointer;
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                                }
                                input[type='range']::-moz-range-thumb {
                                    width: 10px;
                                    height: 10px;
                                    background: #3b82f6;
                                    border-radius: 50%;
                                    cursor: pointer;
                                    border: none;
                                }
                            `}</style>
                            </div>
                            <span className={`text-[11px] font-medium w-10 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {zoom}%
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`w-6 h-6 rounded-full border transition-colors cursor-pointer flex items-center justify-center ${isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                            >
                                {isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
                            </button>
                            <span className={`font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-0.5 border-l pl-2 ml-0.5 border-gray-300 dark:border-gray-700">
                            <button className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                                <LayoutGrid size={14} />
                            </button>
                            <button className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                                <Maximize size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Portal-based dropdown — renders at body level to escape all overflow containers */}
            {showPlusDropdown && dropdownPos && ReactDOM.createPortal(
                <div
                    ref={dropdownRef}
                    className={`fixed w-44 rounded-xl shadow-lg border py-1.5 z-[9999] ${isDark ? 'bg-[#1e1e2e] border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        transform: 'translateY(-100%)',
                    }}
                >
                    <button
                        onClick={() => { setShowPlusDropdown(false); onOpenMediaPanel(); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <CloudUpload size={18} /> Uploads
                    </button>
                    <button
                        onClick={() => {
                            setShowPlusDropdown(false);
                            const newId = Date.now().toString();
                            const newBlankEnd = scenes.reduce((sum, s) => sum + s.duration, 0) + 5.0;
                            setScenes(prev => [...prev, { id: newId, duration: 5.0 }]);
                            setSelectedSceneId(newId);
                            setCurrentTime(newBlankEnd);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <RectangleHorizontal size={18} /> Blank
                    </button>
                </div>,
                document.body
            )}

            {/* Portal-based Ghost Scrubber Tooltip */}
            {hoverTime !== null && hoverScrubberPos && !isDraggingPlayhead && hoveredHandleSceneId === null && resizingScene === null && ReactDOM.createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none flex flex-col items-center"
                    style={{
                        top: hoverScrubberPos.top,
                        left: hoverScrubberPos.left,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '4px'
                    }}
                >
                    <div className="bg-[#1f2937] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[8px] shadow-md">
                        {hoverTime.toFixed(1)}s
                    </div>
                </div>,
                document.body
            )}

            {/* Portal-based Resize Tooltip — appears above blank while dragging resize handle */}
            {resizingScene && resizeTooltip && (() => {
                const activeScene = scenes.find(s => s.id === resizingScene.id);
                if (!activeScene) return null;
                // Both handles now use DOM — read live refs for accurate tooltip display
                const displayDuration = (resizingScene.side === 'left' && liveLeftDrag.current.sceneId === resizingScene.id)
                    ? liveLeftDrag.current.duration
                    : (resizingScene.side === 'right' && liveRightDrag.current.sceneId === resizingScene.id)
                        ? liveRightDrag.current.duration
                        : activeScene.duration;
                return ReactDOM.createPortal(
                    <div
                        className="fixed z-[9999] pointer-events-none flex flex-col items-center"
                        style={{
                            top: resizeTooltip.y - 78,
                            left: resizeTooltip.x,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        {/* Dark pill showing live duration */}
                        <div className="bg-[#1f2937] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[8px] shadow-lg">
                            {displayDuration.toFixed(1)}s
                        </div>
                        {/* Downward-pointing triangle — same caret style as ghost scrubber */}
                        <svg width="12" height="7" viewBox="0 0 12 7" className="text-[#1f2937] mt-[-1px]" fill="currentColor">
                            <path d="M0 0 L12 0 L6 7 Z" />
                        </svg>
                    </div>,
                    document.body
                );
            })()}
        </>
    );
};
