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

    const [containerWidth, setContainerWidth] = useState(0);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverScrubberPos, setHoverScrubberPos] = useState<{ top: number; left: number } | null>(null);
    const [showPlusDropdown, setShowPlusDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const [scenes, setScenes] = useState<{ id: string, duration: number }[]>([]);
    const plusBtnRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - 4;
            const time = pixelToTime(x);
            setHoverTime(time);
            
            setHoverScrubberPos({
                top: rect.top, // top of the timeline strip
                left: rect.left + 4 + timeToPixel(time) // exact screen x of the ghost line
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
                        {hoverTime !== null && !isDraggingPlayhead && (
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
                                transform: `translateX(${timeToPixel(currentTime)}px)`,
                            }}
                        >
                            {/* Rounded Head triangle */}
                            <svg width="10" height="8" viewBox="0 0 10 8" className="absolute top-[2px] left-1/2 -translate-x-1/2 text-gray-800" fill="currentColor">
                                <path d="M2.5 1h5c1.1 0 1.6 1.3.8 2.1L5.8 5.7c-.4.4-1.1.4-1.5 0L1.7 3.1C.9 2.3 1.4 1 2.5 1z" />
                            </svg>
                            
                            {/* Scrubber line starting below major ticks */}
                            <div className="absolute top-[28px] bottom-0 left-0 right-0 bg-gray-800 rounded-full" />

                            <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                {formatTime(currentTime)}
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
                                <div className={`absolute inset-y-0 left-0 right-4 rounded-xl flex items-center gap-1.5 z-10 ${isDark ? 'bg-[#1e1e2e]' : 'bg-[#e5e7eb]'}`}>
                                    
                                    {scenes.map((scene) => (
                                        <div
                                            key={scene.id}
                                            className="h-full bg-white border-[1.5px] border-[#7c3aed] rounded-md flex items-end p-2 flex-shrink-0 shadow-sm"
                                            style={{ width: `${timeToPixel(scene.duration)}px` }}
                                        >
                                            <span className="text-[12.5px] font-bold text-[#1f2937] leading-none tracking-tight">
                                                {scene.duration.toFixed(1)}s
                                            </span>
                                        </div>
                                    ))}

                                    <div className="sticky left-0 px-2 pl-2 flex items-center gap-3 h-full py-[8px] flex-shrink-0">
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
                            setScenes(prev => [...prev, { id: Date.now().toString(), duration: 5.0 }]);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <RectangleHorizontal size={18} /> Blank
                    </button>
                </div>,
                document.body
            )}

            {/* Portal-based Ghost Scrubber Tooltip */}
            {hoverTime !== null && hoverScrubberPos && !isDraggingPlayhead && ReactDOM.createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none flex flex-col items-center"
                    style={{
                        top: hoverScrubberPos.top,
                        left: hoverScrubberPos.left,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '4px' // Push it down slightly more to close the exact gap
                    }}
                >
                    <div className="bg-[#1f2937] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[8px] shadow-md relative group">
                        {hoverTime.toFixed(1)}s
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
