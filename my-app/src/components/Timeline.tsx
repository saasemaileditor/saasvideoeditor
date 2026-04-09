import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Plus, LayoutGrid, Music, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../store/useEditorStore';

interface TimelineProps {
    currentTime: number;
    setCurrentTime: (time: number | ((prev: number) => number)) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    activeScene: number;
    setActiveScene: (scene: number) => void;
    isDark: boolean;
}

export const Timeline = ({
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    activeScene,
    setActiveScene,
    isDark,
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
    const sceneScrollRef = useRef<HTMLDivElement>(null);
    const scenes = useUIStore((state) => state.scenes);
    const addScene = useUIStore((state) => state.addScene);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (sceneScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sceneScrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        const timer = setTimeout(checkScroll, 50);
        return () => {
            window.removeEventListener('resize', checkScroll);
            clearTimeout(timer);
        };
    }, [scenes.length]);

    const scrollScenes = (direction: 'left' | 'right') => {
        if (sceneScrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            sceneScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

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
    }, [isDraggingPlayhead, setCurrentTime]);

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
    }, [isPlaying, setIsPlaying, setCurrentTime]);

    return (
        <div className={`h-[180px] pt-0 pb-2 flex-shrink-0 flex flex-col transition-colors duration-200 overflow-hidden -mx-[10px] -mb-[10px] ${isDark ? 'bg-[#1e1e2e] border-t border-[#2a2d45]' : 'bg-white border-t border-gray-200'}`}>


            {/* Main Timeline Area */}
            <div className="flex-1 flex overflow-hidden">
                <div className={`flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar ${isDark ? 'bg-[#14141d]' : 'bg-white'}`}>
                        <div
                            className="h-full relative transition-all duration-300 ease-out pl-12 pr-12"
                            style={{ minWidth: `${800 + (zoom * 4)}px` }}
                            ref={timelineRef}
                            onMouseDown={handleTimelineMouseDown}
                        >
                        {/* Playhead Marker */}
                        <div className="absolute top-0 bottom-0 w-[2px] z-30 pointer-events-none -translate-x-1/2 left-0"
                            style={{ 
                                transform: `translateX(${Math.round((currentTime / 10) * (timelineRef.current?.clientWidth || (800 + zoom * 4)))}px)`,
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
                        <div className="h-[36px] flex relative pointer-events-none z-10 w-full pt-2">
                            {Array.from({ length: 101 }).map((_, i) => {
                                const unit = i * 10; // 0, 10, 20... 1000
                                const isMajor = unit % 50 === 0; // Every 0.5s if 100=1s
                                const percentage = (unit / 10);
                                return (
                                    <div
                                        key={unit}
                                        className="absolute top-0 bottom-0 flex flex-row items-start pointer-events-none pt-2 -translate-x-1/2"
                                        style={{ left: `${percentage}%` }}
                                    >
                                        <div className={`w-[1.5px] rounded-full ${isMajor ? 'h-5' : 'h-2.5'} ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                                        {isMajor && (
                                            <span className={`text-[14px] font-medium select-none ml-1.5 whitespace-nowrap -mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {(unit / 100).toFixed(1)}s
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tracks Area Container (Below ruler) */}
                        <div className="absolute top-[36px] bottom-0 left-0 right-0 flex flex-col justify-center pb-2 gap-2">
                            {/* Row 1: Add Elements */}
                            <div className="relative h-7 flex items-center">
                                <button className={`sticky left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-colors ${isDark ? 'bg-[#1e1e2e] border border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                    <LayoutGrid size={13} />
                                    Add elements
                                </button>
                            </div>

                            {/* Row 2: Main Track (or drag and drop) */}
                            <div className="relative h-[52px] flex items-center">
                                <div className={`absolute inset-y-0 left-4 right-4 rounded-xl flex items-center px-2 z-10 ${isDark ? 'bg-[#1e1e2e]' : 'bg-[#e5e7eb]'}`}>
                                    <div className="sticky left-6 flex items-center gap-3">
                                        <button className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm cursor-pointer ${isDark ? 'bg-[#2a2d45] text-gray-300 hover:bg-[#323652]' : 'bg-[#d1d5db] text-gray-600 hover:bg-[#c2c6cc] transition-colors'}`}>
                                            <Plus size={16} strokeWidth={2.5} />
                                        </button>
                                        <span className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>or drag and drop media</span>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Add Audio */}
                            <div className="relative h-7 flex items-center">
                                <button className={`sticky left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-colors ${isDark ? 'bg-[#1e1e2e] border border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                    <Music size={13} />
                                    Add audio
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex-shrink-0 flex items-center justify-between mt-1 pl-0 pr-3">
                {/* Left Side: Scene Tabs with Scrolling */}
                <div className="flex items-center gap-0 flex-1 min-w-0 mr-2 relative">
                    <button
                        onClick={() => scrollScenes('left')}
                        className={`absolute left-0 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${canScrollLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'} ${isDark ? 'bg-[#1e1e2e] text-gray-400 border border-gray-700' : 'bg-white text-gray-600 border border-gray-100'}`}
                    >
                        <ChevronLeft size={14} />
                    </button>

                    <div
                        ref={sceneScrollRef}
                        onScroll={checkScroll}
                        className="flex gap-1 items-center overflow-x-auto [&::-webkit-scrollbar]:hidden w-full pl-1 pr-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {scenes.map((sceneNum) => {
                            const isActive = activeScene === sceneNum;
                            return (
                                <button
                                    key={sceneNum}
                                    onClick={() => setActiveScene(sceneNum)}
                                    className={`flex-shrink-0 px-3 h-6 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center ${isActive
                                        ? 'bg-[#7c3aed] text-white'
                                        : isDark
                                            ? 'bg-[#1e1e2e] border border-gray-700 text-gray-400 hover:text-gray-200'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Scene {sceneNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => {
                                addScene();
                                // Scroll right after scene is added 
                                setTimeout(() => {
                                    if (sceneScrollRef.current) {
                                        sceneScrollRef.current.scrollTo({ left: sceneScrollRef.current.scrollWidth, behavior: 'smooth' });
                                    }
                                }, 50);
                            }}
                            className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-colors cursor-pointer ${isDark ? 'bg-[#1e1e2e] border border-gray-700 text-gray-400 hover:text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <button
                        onClick={() => scrollScenes('right')}
                        className={`absolute right-0 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'} ${isDark ? 'bg-[#1e1e2e] text-gray-400 border border-gray-700' : 'bg-white text-gray-600 border border-gray-100'}`}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>

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
                            {formatTime(currentTime)} / 16:40
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
    );
};
