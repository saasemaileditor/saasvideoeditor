import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Play, Pause, Plus, LayoutGrid, Music, Maximize, CloudUpload, RectangleHorizontal, StepForward } from 'lucide-react';
import { useEditorStore, getHistoryControls } from '../store/useEditorStore';

interface TimelineProps {
    currentTime: number;
    setCurrentTime: (time: number | ((prev: number) => number)) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    isDark: boolean;
    onOpenMediaPanel: () => void;
}

const PROJECT_FPS = 30; // Default FPS for timecode display

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
    const timelineRef = useRef<HTMLDivElement>(null);
    // New state: scrubber follows resize handle and fades while dragging
    const [scrubberTime, setScrubberTime] = useState(currentTime);
    const [scrubberFaded, setScrubberFaded] = useState(false);
    const [scrubberSnapped, setScrubberSnapped] = useState(false); // true when resize handle snaps to scrubber


    // ─── Global Scene State (shared undo/redo via zustand-travel) ──────────────
    const scenes = useEditorStore((state) => state.scenes);
    const { addScene, updateScene, removeScene } = useEditorStore();

    // Derived duration from scenes (minimum 5s, like Canva)
    const duration = useMemo(() => {
        const contentDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
        return Math.max(contentDuration, 5.0);
    }, [scenes]);

    // Click vs Drag detection for resize handles
    const [pendingResizeClick, setPendingResizeClick] = useState<{
        sceneId: string;
        side: 'left' | 'right';
        startX: number;
        startY: number;
        clickTime: number;
        startDuration: number;
        startLeadingGap: number;
    } | null>(null);
    const RESIZE_DRAG_THRESHOLD = 5; // pixels - must move more than this to be considered a drag

    const [containerWidth, setContainerWidth] = useState(0);
    const [vertSBWidth, setVertSBWidth] = useState(0); // vertical scrollbar width of tracks area
    const scrollParentRef = useRef<HTMLDivElement>(null);
    const tracksScrollRef = useRef<HTMLDivElement>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverScrubberPos, setHoverScrubberPos] = useState<{ top: number; left: number } | null>(null);
    const [showPlusDropdown, setShowPlusDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const [showGapDropdown, setShowGapDropdown] = useState(false);
    const [gapDropdownPos, setGapDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const [activeGapIndex, setActiveGapIndex] = useState<number | null>(null);
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
    const [hoveredGapIndex, setHoveredGapIndex] = useState<number | null>(null);
    const [isHoveringVertSB, setIsHoveringVertSB] = useState(false); // tracks hover on vertical scrollbar strip
    const plusBtnRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const gapDropdownRef = useRef<HTMLDivElement>(null);
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

    // Close gap dropdown on click outside
    useEffect(() => {
        if (!showGapDropdown) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (gapDropdownRef.current && !gapDropdownRef.current.contains(e.target as Node)) {
                setShowGapDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showGapDropdown]);

    // Close main dropdown on click outside
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


    // Track the tracks scroll area's width and vertical scrollbar width
    useEffect(() => {
        if (!tracksScrollRef.current) return;
        const observer = new ResizeObserver(() => {
            if (tracksScrollRef.current) {
                setContainerWidth(tracksScrollRef.current.clientWidth);
                // vertical scrollbar width = offsetWidth - clientWidth
                setVertSBWidth(tracksScrollRef.current.offsetWidth - tracksScrollRef.current.clientWidth);
            }
        });
        observer.observe(tracksScrollRef.current);
        return () => observer.disconnect();
    }, []);

    const pixelsPerSecond = (() => {
        // Map 10-1000 zoom range to a 0.0 -> 1.0 slider ratio
        const zoomRatio = (zoom - 10) / 990;
        // Exponentially scale up to exactly 150x the power (12 * 150 = 1800 max pps)
        return 12 * Math.pow(150, zoomRatio);
    })();

    // Actual pixel width of the video content at current zoom
    const contentWidth = Math.ceil(duration * pixelsPerSecond);
    // True when content is wider than the visible tracks container → real horizontal scrollbar appears
    const hasHorizontalOverflow = contentWidth > containerWidth;
    // timelineWidth: equals containerWidth when content fits (zero overflow = no scrollbar),
    // equals contentWidth when zoomed in (overflow = real scrollbar appears),
    // equals containerWidth+1 when hovering vertical scrollbar (triggers real scrollbar as a peek hint)
    const timelineWidth = hasHorizontalOverflow ? contentWidth + 32 : (isHoveringVertSB ? containerWidth + 1 : containerWidth);
    // rulerDuration: how many seconds the visible ruler covers
    const rulerDuration = timelineWidth / pixelsPerSecond;

    // ─── Timeline Keyboard Shortcuts ──────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable) return;

            const frameDuration = 1 / PROJECT_FPS;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    setIsPlaying(!isPlaying);
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    if (e.shiftKey) {
                        setCurrentTime((prev: number) => Math.max(0, prev - 1));
                    } else {
                        setCurrentTime((prev: number) => Math.max(0, prev - frameDuration));
                    }
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    if (e.shiftKey) {
                        setCurrentTime((prev: number) => Math.min(rulerDuration, prev + 1));
                    } else {
                        setCurrentTime((prev: number) => Math.min(rulerDuration, prev + frameDuration));
                    }
                    break;

                case 'Home':
                    e.preventDefault();
                    setCurrentTime(0);
                    break;

                case 'End':
                    e.preventDefault();
                    setCurrentTime(rulerDuration);
                    break;

                case '+':
                case '=':
                    e.preventDefault();
                    setZoom(prev => Math.min(1000, prev + 100));
                    break;

                case '-':
                    e.preventDefault();
                    setZoom(prev => Math.max(10, prev - 100));
                    break;

                case 'Delete':
                case 'Backspace':
                    if (selectedSceneId) {
                        e.preventDefault();
                        removeScene(selectedSceneId);
                        getHistoryControls().archive();
                        window.dispatchEvent(new CustomEvent('history-updated'));
                        setSelectedSceneId(null);
                    }
                    break;

                // Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y are handled globally in SaasVideoEditor
                // via getHistoryControls().back() / .forward() which now covers scenes too.
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, setIsPlaying, setCurrentTime, rulerDuration, setZoom, selectedSceneId, removeScene]);


    // ─── Adaptive ruler tick generation (industry-standard: intervals adapt to zoom) ──
    const rulerTicks = useMemo(() => {
        const MIN_MAJOR_TICK_SPACING = 180; // minimum pixels between major tick labels

        // User-requested progression: 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60...
        const NICE_INTERVALS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

        // Pick the smallest interval that keeps labels from overlapping based on actual screen pixels
        let majorInterval = NICE_INTERVALS[NICE_INTERVALS.length - 1];
        for (const interval of NICE_INTERVALS) {
            if (interval * pixelsPerSecond >= MIN_MAJOR_TICK_SPACING) {
                majorInterval = interval;
                break;
            }
        }

        // Sub-divisions per major interval
        const getSubDivisions = (interval: number): number => {
            if (interval <= 0.1) return 5; // 0.02 gap
            if (interval <= 0.2) return 4; // 0.05 gap
            if (interval <= 0.5) return 5; // 0.1 gap
            if (interval <= 1) return 5;   // 0.2 gap
            if (interval <= 2) return 4;   // 0.5 gap
            if (interval <= 5) return 5;   // 1 gap
            if (interval <= 10) return 5;  // 2 gap
            if (interval <= 15) return 3;  // 5 gap
            if (interval <= 30) return 6;  // 5 gap
            if (interval <= 60) return 6;  // 10 gap
            if (interval <= 120) return 4; // 30 gap
            if (interval <= 300) return 5; // 60 gap
            return 6;
        };
        const subDivisions = getSubDivisions(majorInterval);

        const ticks: { time: number; isMajor: boolean }[] = [];
        const totalMajor = Math.ceil(rulerDuration / majorInterval);

        for (let i = 0; i <= totalMajor; i++) {
            const majorTime = parseFloat((i * majorInterval).toFixed(4));
            if (majorTime > rulerDuration) break;
            ticks.push({ time: majorTime, isMajor: true });

            // Sub-ticks within this segment
            if (i < totalMajor) {
                for (let sub = 1; sub < subDivisions; sub++) {
                    const subTime = parseFloat((majorTime + sub * (majorInterval / subDivisions)).toFixed(4));
                    if (subTime <= rulerDuration && subTime < parseFloat(((i + 1) * majorInterval).toFixed(4))) {
                        ticks.push({ time: subTime, isMajor: false });
                    }
                }
            }
        }
        return ticks;
    }, [rulerDuration, pixelsPerSecond]);

    // ─── Time ↔ pixel helpers ─────────────────────────────────────────────────
    const timeToPixel = (t: number) => Math.round(t * pixelsPerSecond);
    const pixelToTime = (px: number) => {
        const clamped = Math.max(0, px);
        return Math.min(clamped / pixelsPerSecond, rulerDuration);
    };

    const formatTooltipTime = (t: number) => {
        const decimals = zoom >= 400 ? 2 : 1;
        const factor = Math.pow(10, decimals);
        // Truncate cleanly while avoiding strict floating-point underflow (e.g. 0.19999->0.19)
        return (Math.floor(t * factor + 1e-6) / factor).toFixed(decimals);
    };

    // Magnetic Snapping Utility (4 pixels pull radius)
    const getSnappedTime = (rawTime: number) => {
        if (!rulerTicks || rulerTicks.length === 0) return rawTime;
        const timeSnapThreshold = 4 / pixelsPerSecond;
        let closestTick = rulerTicks[0];
        let minDiff = Infinity;
        for (const tick of rulerTicks) {
            const diff = Math.abs(tick.time - rawTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestTick = tick;
            }
        }
        if (minDiff <= timeSnapThreshold) {
            return closestTick.time;
        }
        return rawTime;
    };

    const handleTimelineMouseMove = (e: React.MouseEvent) => {
        // Don't update hover state during an active resize drag
        if (resizingScene !== null) return;
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - 4;
            const time = getSnappedTime(pixelToTime(x));
            setHoverTime(time);

            setHoverScrubberPos({
                top: scrollParentRef.current ? scrollParentRef.current.getBoundingClientRect().top : rect.top,
                left: rect.left + 4 + timeToPixel(time)
            });
        }
    };

    const handleTimelineMouseDown = (e: React.MouseEvent) => {
        // Check if click came from resize handle
        const target = e.target as HTMLElement;
        const isResizeHandle = target.closest('[data-resize-handle]') !== null;

        if (isResizeHandle) {
            return;
        }

        // Guard: ignore clicks on the native vertical scrollbar (right edge of tracks container)
        if (tracksScrollRef.current) {
            const scrollRect = tracksScrollRef.current.getBoundingClientRect();
            if (e.clientX > scrollRect.right - 20) return;
        }

        setIsDraggingPlayhead(true);
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - 4;
            setCurrentTime(getSnappedTime(pixelToTime(x)));
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingPlayhead && timelineRef.current) {
                const rect = timelineRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left - 4;
                setCurrentTime(getSnappedTime(pixelToTime(x)));
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
                    if (prev >= rulerDuration) {
                        setIsPlaying(false);
                        return rulerDuration;
                    }
                    return prev + 0.1;
                });
            }, 100);
        }
        return () => window.clearInterval(interval);
    }, [isPlaying, setIsPlaying, setCurrentTime, duration]);

    // ─── Ruler label formatter (smart: shows m:ss for ≥60s) ──
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

        // Set up pending click - we don't know yet if this is a click or drag
        setPendingResizeClick({
            sceneId,
            side,
            startX: e.clientX,
            startY: e.clientY,
            clickTime: Date.now(),
            startDuration: currentDuration,
            startLeadingGap: scene?.leadingGap || 0
        });

        // Don't start resize yet - wait to see if user drags
        // Scrubber stays at current position for now
        setScrubberFaded(true);
        setScrubberTime(currentTime);
        setScrubberSnapped(false);
    };

    useEffect(() => {
        if (!resizingScene) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - resizingScene.startX;

            // Calculate current resize handle position in time
            // Read scenes imperatively to avoid stale closure during drag
            const currentScenes = useEditorStore.getState().scenes;
            const sceneIdx = currentScenes.findIndex(s => s.id === resizingScene.id);
            const priorDuration = currentScenes.slice(0, sceneIdx).reduce((sum, s) => sum + s.duration, 0);
            const sceneStartTime = priorDuration + (currentScenes[sceneIdx].leadingGap || 0);

            // Calculate where the resize edge currently is (in time)
            let currentEdgeTime: number;
            if (resizingScene.side === 'right') {
                const startScenePx = Math.round(resizingScene.startDuration * pixelsPerSecond);
                const minScenePx = Math.round(0.3 * pixelsPerSecond);
                const newScenePxRaw = Math.max(minScenePx, startScenePx + deltaX);
                currentEdgeTime = sceneStartTime + (newScenePxRaw / pixelsPerSecond);
            } else {
                const startLeadingPx = Math.round(resizingScene.startLeadingGap * pixelsPerSecond);
                const startScenePx = Math.round(resizingScene.startDuration * pixelsPerSecond);
                const rightEdge = startLeadingPx + startScenePx;
                const minScenePx = Math.round(0.3 * pixelsPerSecond);

                let newSpacerPxRaw = startLeadingPx + deltaX;
                if (newSpacerPxRaw < 0) {
                    newSpacerPxRaw = 0;
                } else {
                    const newScenePxCheck = rightEdge - newSpacerPxRaw;
                    if (newScenePxCheck < minScenePx) {
                        newSpacerPxRaw = rightEdge - minScenePx;
                    }
                }
                currentEdgeTime = priorDuration + (newSpacerPxRaw / pixelsPerSecond);
            }

            // SNAP LOGIC: Check if within 10 pixels of scrubber (in time)
            const snapThresholdPx = 5; // 5 pixels threshold
            const snapThresholdTime = snapThresholdPx / pixelsPerSecond; // convert to time
            const distanceToScrubber = Math.abs(currentEdgeTime - scrubberTime);
            const isNearScrubber = distanceToScrubber <= snapThresholdTime;

            if (resizingScene.side === 'right') {
                // Right handle: pure DOM update — same pattern as left, zero shake
                const startScenePx = Math.round(resizingScene.startDuration * pixelsPerSecond);
                const minScenePx = Math.round(0.3 * pixelsPerSecond);
                let newScenePx = Math.max(minScenePx, startScenePx + deltaX);

                // Apply MAGNETIC SNAP if near scrubber - edge JUMPS to scrubber position
                if (isNearScrubber) {
                    const targetScenePx = (scrubberTime - sceneStartTime) * pixelsPerSecond;
                    newScenePx = Math.max(minScenePx, targetScenePx);
                    // When snapped, edge is now exactly at scrubber position
                }

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

                // Apply MAGNETIC SNAP if near scrubber - edge JUMPS to scrubber position
                if (isNearScrubber) {
                    const targetSpacerPx = (scrubberTime - priorDuration) * pixelsPerSecond;
                    newSpacerPx = Math.max(0, targetSpacerPx);
                    newScenePx = rightEdge - newSpacerPx;
                    if (newScenePx < minScenePx) {
                        newScenePx = minScenePx;
                        newSpacerPx = rightEdge - minScenePx;
                    }
                    // When snapped, edge is now exactly at scrubber position
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

            // Turn scrubber purple ONLY when magnetically snapped
            if (isNearScrubber !== scrubberSnapped) {
                setScrubberSnapped(isNearScrubber);
            }

            // Small tooltip re-render; React reads liveLeftDrag.current for widths → no conflict
            setResizeTooltip(prev => prev ? { ...prev, x: e.clientX } : null);
        };

        const handleMouseUp = () => {
            // Read scenes imperatively to avoid stale closure
            const currentScenes = useEditorStore.getState().scenes;
            if (resizingScene.side === 'right') {
                // Commit final right-handle duration from DOM to React state
                const finalDuration = liveRightDrag.current.sceneId === resizingScene.id
                    ? liveRightDrag.current.duration
                    : resizingScene.startDuration;
                // Update scene via global store
                updateScene(resizingScene.id, { duration: parseFloat(finalDuration.toFixed(2)) });
                getHistoryControls().archive();
                window.dispatchEvent(new CustomEvent('history-updated'));
                // Calculate new right edge position for scrubber (sum of prior durations + new duration)
                const sceneIdx = currentScenes.findIndex(s => s.id === resizingScene.id);
                const priorDuration = currentScenes.slice(0, sceneIdx).reduce((sum, s) => sum + s.duration, 0);
                const newEdgePosition = priorDuration + parseFloat(finalDuration.toFixed(2));
                setScrubberTime(newEdgePosition);
                setCurrentTime(newEdgePosition);
                liveRightDrag.current = { sceneId: null, scenePx: 0, duration: 0 };
            } else {
                // Commit final left-handle duration, reset leadingGap to 0 — scenes snap back
                const finalDuration = liveLeftDrag.current.sceneId === resizingScene.id
                    ? liveLeftDrag.current.duration
                    : resizingScene.startDuration;
                updateScene(resizingScene.id, { duration: parseFloat(finalDuration.toFixed(2)), leadingGap: 0 });
                getHistoryControls().archive();
                window.dispatchEvent(new CustomEvent('history-updated'));
                // Update scrubber position to the new start of the scene (left handle)
                const sceneIdx = currentScenes.findIndex(s => s.id === resizingScene.id);
                const priorDuration = currentScenes.slice(0, sceneIdx).reduce((sum, s) => sum + s.duration, 0);
                setScrubberTime(priorDuration);
                setCurrentTime(priorDuration);
                liveLeftDrag.current = { sceneId: null, spacerPx: 0, scenePx: 0, duration: 0 };
            }
            // End of resize: stop fading and reset snap
            setScrubberFaded(false);
            setScrubberSnapped(false);
            setResizingScene(null);
            setResizeTooltip(null);
            setPendingResizeClick(null); // Also clear any pending click
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingScene, pixelsPerSecond, duration, scrubberSnapped, scrubberTime]);

    // Click vs Drag detection for resize handles
    useEffect(() => {
        if (!pendingResizeClick) return;

        let hasDragged = false;
        const startX = pendingResizeClick.startX;
        const startY = pendingResizeClick.startY;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = Math.abs(e.clientX - startX);
            const deltaY = Math.abs(e.clientY - startY);
            const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // If moved more than threshold, this is a drag - start actual resize
            if (totalDelta > RESIZE_DRAG_THRESHOLD && !hasDragged) {
                hasDragged = true;

                // Convert pending click to actual resize
                setResizingScene({
                    id: pendingResizeClick.sceneId,
                    side: pendingResizeClick.side,
                    startX: pendingResizeClick.startX,
                    startDuration: pendingResizeClick.startDuration,
                    startLeadingGap: pendingResizeClick.startLeadingGap
                });
                setResizeTooltip({ x: e.clientX, y: e.clientY });

                // Clear pending click
                setPendingResizeClick(null);
            }
        };

        const handleMouseUp = () => {
            if (!hasDragged) {
                // This was a simple click - move scrubber to actual click position
                // Use the actual X coordinate where user clicked, converted to time
                if (timelineRef.current) {
                    const rect = timelineRef.current.getBoundingClientRect();
                    const clickX = pendingResizeClick.startX - rect.left - 4; // 4px padding
                    const clickTimePosition = getSnappedTime(pixelToTime(clickX));

                    // Move scrubber to actual click position
                    setScrubberTime(clickTimePosition);
                    setCurrentTime(clickTimePosition);
                }
            }

            // Clean up
            setPendingResizeClick(null);
            setScrubberFaded(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [pendingResizeClick, pixelsPerSecond, duration, scenes]);

    return (
        <>
            <div className={`h-[180px] pt-0 pb-2 flex-shrink-0 flex flex-col transition-colors duration-200 overflow-hidden -mx-[10px] -mb-[10px] ${isDark ? 'bg-[#1e1e2e] border-t border-[#2a2d45]' : 'bg-white border-t border-gray-200'}`}>


                {/* Main Timeline Area — ruler and tracks are SEPARATE scroll containers */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* ── Ruler Row ── horizontal scroll synced to tracks, scrollbar hidden */}
                    <div
                        ref={scrollParentRef}
                        className={`flex-shrink-0 overflow-x-hidden ${isDark ? 'bg-[#14141d]' : 'bg-white'}`}
                    >
                        <div
                            className="h-[36px] relative px-1"
                            style={{ minWidth: `${timelineWidth + vertSBWidth + 38}px` }}
                            onMouseDown={handleTimelineMouseDown}
                            onMouseMove={handleTimelineMouseMove}
                            onMouseLeave={() => { setHoverTime(null); setHoverScrubberPos(null); }}
                        >
                            {/* Ghost scrubber triangle (ruler only) */}
                            {hoverTime !== null && !isDraggingPlayhead && hoveredHandleSceneId === null && resizingScene === null && (
                                <div className="absolute top-0 bottom-0 w-[2px] z-35 pointer-events-none left-1"
                                    style={{ transform: `translateX(${timeToPixel(hoverTime)}px)` }}
                                >
                                    <svg width="10" height="8" viewBox="0 0 10 8" className="absolute top-[2px] left-1/2 -translate-x-1/2 text-[#1f2937]" fill="currentColor">
                                        <path d="M2.5 1h5c1.1 0 1.6 1.3.8 2.1L5.8 5.7c-.4.4-1.1.4-1.5 0L1.7 3.1C.9 2.3 1.4 1 2.5 1z" />
                                    </svg>
                                </div>
                            )}

                            {/* Playhead triangle (ruler only) */}
                            <div className="absolute top-0 bottom-0 w-[2px] z-35 pointer-events-none left-1"
                                style={{
                                    transform: `translateX(${timeToPixel(scrubberFaded ? scrubberTime : currentTime)}px)`,
                                    opacity: scrubberSnapped ? 1 : (scrubberFaded ? 0.5 : 1)
                                }}
                            >
                                <svg width="10" height="8" viewBox="0 0 10 8" className={`absolute top-[2px] left-1/2 -translate-x-1/2 transition-colors duration-150 ${scrubberSnapped ? 'text-[#7c3aed]' : 'text-gray-800'}`} fill="currentColor">
                                    <path d="M2.5 1h5c1.1 0 1.6 1.3.8 2.1L5.8 5.7c-.4.4-1.1.4-1.5 0L1.7 3.1C.9 2.3 1.4 1 2.5 1z" />
                                </svg>
                            </div>

                            {/* Ruler ticks */}
                            <div className="h-[36px] flex absolute inset-x-1 z-10 pt-2 cursor-col-resize">
                                {rulerTicks.map((tick) => (
                                    <div
                                        key={tick.time}
                                        className="absolute top-0 bottom-0 flex flex-row items-start pointer-events-none pt-2"
                                        style={{ left: `${timeToPixel(tick.time)}px` }}
                                    >
                                        <div className={`w-[2px] rounded-full ${tick.isMajor ? 'h-5' : 'h-2.5 mt-[5px]'} ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                                        {tick.isMajor && (
                                            <span className={`text-[14px] font-medium select-none ml-1.5 whitespace-nowrap -mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatRulerLabel(tick.time)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Tracks Row ── synced horizontally + vertical scrollbar always pinned to right edge */}
                    <div
                        ref={tracksScrollRef}
                        className={`flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative ${isDark ? 'bg-[#14141d]' : 'bg-white'}`}
                        onScroll={() => {
                            if (tracksScrollRef.current && scrollParentRef.current) {
                                scrollParentRef.current.scrollLeft = tracksScrollRef.current.scrollLeft;
                            }
                        }}
                        onMouseMove={(e) => {
                            if (tracksScrollRef.current && !hasHorizontalOverflow) {
                                const rect = tracksScrollRef.current.getBoundingClientRect();
                                // Vertical scrollbar strip is the rightmost ~12px of the element
                                const inVertSBStrip = e.clientX >= rect.right - 12;
                                setIsHoveringVertSB(inVertSBStrip);
                            }
                        }}
                        onMouseLeave={() => setIsHoveringVertSB(false)}
                    >
                        <div
                            className="relative transition-all duration-300 ease-out px-1"
                            style={{ minWidth: `${timelineWidth}px` }}
                            ref={timelineRef}
                            onMouseDown={handleTimelineMouseDown}
                            onMouseMove={handleTimelineMouseMove}
                            onMouseLeave={() => { setHoverTime(null); setHoverScrubberPos(null); }}
                        >
                            {/* Ghost scrubber line (tracks only) */}
                            {hoverTime !== null && !isDraggingPlayhead && hoveredHandleSceneId === null && resizingScene === null && (
                                <div className="absolute top-0 bottom-0 w-[2px] z-35 pointer-events-none left-1"
                                    style={{ transform: `translateX(${timeToPixel(hoverTime)}px)` }}
                                >
                                    <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-800 opacity-60 rounded-full" />
                                </div>
                            )}

                            {/* Playhead line (tracks only) */}
                            <div className="absolute top-0 bottom-0 w-[2px] z-35 pointer-events-none left-1"
                                style={{
                                    transform: `translateX(${timeToPixel(scrubberFaded ? scrubberTime : currentTime)}px)`,
                                    opacity: scrubberSnapped ? 1 : (scrubberFaded ? 0.5 : 1)
                                }}
                            >
                                <div className={`absolute top-0 bottom-0 left-0 right-0 rounded-full transition-colors duration-150 ${scrubberSnapped ? 'bg-[#7c3aed]' : 'bg-gray-800'}`} />
                            </div>

                            {/* Tracks content */}
                            <div className="flex flex-col gap-[2px] py-0">

                                {/* Row 1: Add Elements */}
                                <div className="relative h-9 shrink-0 flex items-center">
                                    <button className={`sticky left-0 z-15 flex items-center gap-2.5 px-4 py-1.5 rounded-[10px] text-[13px] font-semibold shadow-sm transition-colors ${isDark ? 'bg-[#1e1e2e] text-gray-300 hover:bg-gray-800' : 'bg-[#e5e7eb] text-gray-700 hover:bg-[#d1d5db]'}`}>
                                        <LayoutGrid size={15} />
                                        Add elements
                                    </button>
                                </div>

                                <div className="relative h-[62px] shrink-0 flex items-center">
                                    <div className={`absolute inset-y-0 left-0 rounded-xl flex items-center z-10 ${isDark ? 'bg-[#1e1e2e]' : 'bg-[#e5e7eb]'}`} style={{ width: `${Math.max(containerWidth * 0.95, contentWidth + 66)}px` }}>

                                        {scenes.map((scene, sceneIndex) => {
                                            const isSelected = selectedSceneId === scene.id;
                                            const isLiveLeftDrag = liveLeftDrag.current.sceneId === scene.id;
                                            const isLiveRightDrag = liveRightDrag.current.sceneId === scene.id;
                                            const spacerPx = isLiveLeftDrag
                                                ? liveLeftDrag.current.spacerPx
                                                : Math.round((scene.leadingGap || 0) * pixelsPerSecond);
                                            const scenePx = isLiveLeftDrag
                                                ? liveLeftDrag.current.scenePx
                                                : isLiveRightDrag
                                                    ? liveRightDrag.current.scenePx
                                                    : timeToPixel(scene.duration);
                                            return (
                                                <React.Fragment key={scene.id}>
                                                    {/* Leading gap spacer */}
                                                    <div
                                                        ref={(el) => { spacerRefs.current.set(scene.id, el); }}
                                                        className="h-full flex-shrink-0 pointer-events-none"
                                                        style={{ width: `${spacerPx}px` }}
                                                    />
                                                    <div
                                                        ref={(el) => { sceneRefs.current.set(scene.id, el); }}
                                                        onClick={() => setSelectedSceneId(isSelected ? null : scene.id)}
                                                        className={`relative h-full bg-white rounded-md overflow-hidden flex items-end p-2 flex-shrink-0 cursor-pointer border-[1.5px] group/scene ${isSelected ? 'border-[#7c3aed]' : 'border-[#d1d5db]'}`}
                                                        style={{ width: `${scenePx}px` }}
                                                    >
                                                        {isSelected && resizingScene?.id !== scene.id && (
                                                            <span className={`text-[12.5px] font-bold text-[#1f2937] leading-none tracking-tight transition-opacity ${hoveredHandleSceneId === scene.id ? 'opacity-0' : 'opacity-100'}`}>
                                                                {scene.duration.toFixed(1)}s
                                                            </span>
                                                        )}

                                                        <>
                                                            <div
                                                                data-resize-handle="left"
                                                                className={`absolute left-0 top-0 bottom-0 w-[40px] flex items-center justify-start pl-[9px] cursor-ew-resize transition-opacity z-10 ${hoveredHandleSceneId === scene.id ? 'opacity-100' : 'opacity-0'}`}
                                                                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.07) 55%, transparent 100%)' }}
                                                                onMouseEnter={() => setHoveredHandleSceneId(scene.id)}
                                                                onMouseLeave={() => setHoveredHandleSceneId(null)}
                                                                onMouseDown={(e) => handleResizeStart(e, scene.id, 'left', scene.duration)}
                                                            >
                                                                <div className="w-[3px] h-[26px] bg-white rounded-full shadow-md flex-shrink-0" />
                                                            </div>
                                                            <div
                                                                data-resize-handle="right"
                                                                className={`absolute right-0 top-0 bottom-0 w-[40px] flex items-center justify-end pr-[9px] cursor-ew-resize transition-opacity z-10 ${hoveredHandleSceneId === scene.id ? 'opacity-100' : 'opacity-0'}`}
                                                                style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.07) 55%, transparent 100%)' }}
                                                                onMouseEnter={() => setHoveredHandleSceneId(scene.id)}
                                                                onMouseLeave={() => setHoveredHandleSceneId(null)}
                                                                onMouseDown={(e) => handleResizeStart(e, scene.id, 'right', scene.duration)}
                                                            >
                                                                <div className="w-[3px] h-[26px] bg-white rounded-full shadow-md flex-shrink-0" />
                                                            </div>
                                                        </>

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

                                                    {sceneIndex < scenes.length - 1 && (
                                                        <div
                                                            className="relative flex-shrink-0 self-stretch"
                                                            style={{ width: '0px', zIndex: 25 }}
                                                        >
                                                            <div
                                                                className="absolute inset-y-0 flex items-center justify-center"
                                                                style={{ width: '8px', left: '-4px', cursor: 'default' }}
                                                                onMouseEnter={() => setHoveredGapIndex(sceneIndex)}
                                                                onMouseLeave={() => setHoveredGapIndex(null)}
                                                            >
                                                                <div
                                                                    className="flex flex-col items-center gap-[6px] transition-all duration-150"
                                                                    style={{
                                                                        opacity: hoveredGapIndex === sceneIndex ? 1 : 0,
                                                                        transform: hoveredGapIndex === sceneIndex ? 'scale(1)' : 'scale(0.7)',
                                                                        pointerEvents: hoveredGapIndex === sceneIndex ? 'auto' : 'none',
                                                                    }}
                                                                >
                                                                    <div className="relative group/plus">
                                                                        <div
                                                                            className="w-[24px] h-[24px] rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                                                setGapDropdownPos({ top: rect.top, left: rect.left + rect.width / 2 });
                                                                                setActiveGapIndex(sceneIndex);
                                                                                setShowGapDropdown(prev => !prev);
                                                                            }}
                                                                        >
                                                                            <Plus size={13} strokeWidth={2.5} className="text-gray-600" />
                                                                        </div>
                                                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] opacity-0 group-hover/plus:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                                                                            <div className="bg-[#1f2937] text-white text-[11px] font-medium px-2 py-1 rounded-md shadow-lg">Add media / blank</div>
                                                                            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#1f2937] mx-auto" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="relative group/trans">
                                                                        <div
                                                                            className="w-[24px] h-[24px] rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                                                                            onClick={(e) => { e.stopPropagation(); }}
                                                                        >
                                                                            <StepForward size={12} strokeWidth={2} className="text-gray-600" />
                                                                        </div>
                                                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] opacity-0 group-hover/trans:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                                                                            <div className="bg-[#1f2937] text-white text-[11px] font-medium px-2 py-1 rounded-md shadow-lg">Add transition</div>
                                                                            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#1f2937] mx-auto" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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
                                    className={`w-48 h-1 rounded-full appearance-none cursor-pointer outline-none transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                                    style={{
                                        backgroundImage: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(zoom / 1000) * 100}%, transparent ${(zoom / 1000) * 100}%, transparent 100%)`,
                                    }}
                                />
                                <style>{`
                                input[type='range']::-webkit-slider-thumb {
                                    -webkit-appearance: none;
                                    appearance: none;
                                    width: 10px;
                                    height: 10px;
                                    background: #8b5cf6;
                                    border-radius: 50%;
                                    cursor: pointer;
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                                }
                                input[type='range']::-moz-range-thumb {
                                    width: 10px;
                                    height: 10px;
                                    background: #8b5cf6;
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
                            <span className={`text-[11px] font-medium tracking-[0.02em] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {`${formatTime(currentTime)} / ${formatTime(rulerDuration)}`}
                            </span>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-0.5 border-l pl-2 ml-0.5 border-gray-300 dark:border-gray-700">
                            <button className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                                <LayoutGrid size={16} />
                            </button>
                            <button className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                                <Maximize size={16} />
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
                            const currentScenes = useEditorStore.getState().scenes;
                            const newBlankEnd = currentScenes.reduce((sum, s) => sum + s.duration, 0) + 5.0;
                            addScene({ id: newId, duration: 5.0 });
                            getHistoryControls().archive();
                            window.dispatchEvent(new CustomEvent('history-updated'));
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

            {/* Portal-based Gap Dropdown — same style as main plus dropdown */}
            {showGapDropdown && gapDropdownPos && ReactDOM.createPortal(
                <div
                    ref={gapDropdownRef}
                    className={`fixed w-44 rounded-xl shadow-lg border py-1.5 z-[9999] ${isDark ? 'bg-[#1e1e2e] border-gray-700' : 'bg-white border-gray-200'}`}
                    style={{
                        top: gapDropdownPos.top,
                        left: gapDropdownPos.left,
                        transform: 'translate(-50%, -100%) translateY(-8px)',
                    }}
                >
                    <button
                        onClick={() => {
                            setShowGapDropdown(false);
                            onOpenMediaPanel();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <CloudUpload size={18} /> Uploads
                    </button>
                    <button
                        onClick={() => {
                            setShowGapDropdown(false);
                            if (activeGapIndex === null) return;
                            const newId = Date.now().toString();
                            const currentScenes = useEditorStore.getState().scenes;
                            addScene({ id: newId, duration: 5.0 }, activeGapIndex + 1);
                            getHistoryControls().archive();
                            window.dispatchEvent(new CustomEvent('history-updated'));
                            setSelectedSceneId(newId);
                            // move scrubber to end of new blank
                            const priorDuration = currentScenes.slice(0, activeGapIndex + 1).reduce((sum, s) => sum + s.duration, 0);
                            setCurrentTime(priorDuration + 5.0);
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
                        {formatTooltipTime(hoverTime)}s
                    </div>
                </div>,
                document.body
            )}

            {/* Portal-based Real Scrubber Timer Tooltip — shown only while dragging the playhead */}
            {isDraggingPlayhead && timelineRef.current && (() => {
                const rect = timelineRef.current!.getBoundingClientRect();
                return ReactDOM.createPortal(
                    <div
                        className="fixed z-[9999] pointer-events-none flex flex-col items-center"
                        style={{
                            top: scrollParentRef.current ? scrollParentRef.current.getBoundingClientRect().top : rect.top,
                            left: rect.left + 4 + timeToPixel(currentTime),
                            transform: 'translate(-50%, -100%)',
                            marginTop: '4px'
                        }}
                    >
                        <div className="bg-[#1f2937] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[8px] shadow-md">
                            {formatTooltipTime(currentTime)}s
                        </div>
                    </div>,
                    document.body
                );
            })()}

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
