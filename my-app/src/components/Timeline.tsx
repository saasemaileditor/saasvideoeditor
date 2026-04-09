import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Plus, LayoutGrid, Music } from 'lucide-react';

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
    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const timelineRef = useRef<HTMLDivElement>(null);

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
        <div className={`h-[180px] p-3 rounded-xl flex-shrink-0 flex flex-col transition-colors duration-200 overflow-hidden ${isDark ? 'bg-[#1a1a24] border border-[#2a2d45]' : 'bg-[#f5f5f5] border border-gray-200'}`}>
            {/* Top controls area: Scene tabs + Tools */}
            <div className="flex-shrink-0 flex items-center justify-between gap-2 border-b-transparent mb-2">
                {/* Left Side: Playback & Scenes */}
                <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-8 h-8 rounded-full border transition-colors cursor-pointer flex items-center justify-center ${isDark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                    >
                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                    </button>

                    {/* Time Display */}
                    <span className={`font-mono text-xs font-medium px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {Math.floor(currentTime)}:{(Math.floor((currentTime % 1) * 100)).toString().padStart(2, '0')} / 0:10
                    </span>

                    <div className={`w-px h-4 mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

                    {/* Scene Tabs */}
                    <div className="flex gap-1">
                        {[1, 2].map((sceneNum) => {
                            const isActive = activeScene === sceneNum;
                            return (
                                <button
                                    key={sceneNum}
                                    onClick={() => setActiveScene(sceneNum)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${isActive
                                        ? 'bg-[#7c3aed] text-white'
                                        : isDark
                                            ? 'bg-transparent text-gray-400 hover:text-gray-200'
                                            : 'bg-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Scene {sceneNum}
                                </button>
                            );
                        })}
                        <button className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Timeline Area */}
            <div className="flex-1 flex overflow-hidden gap-3">

                {/* Left Sidebar (Add Elements/Audio) */}
                <div className="flex flex-col gap-2 w-[140px] flex-shrink-0 pt-6">
                    <button className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${isDark ? 'bg-[#1e1e2e] border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                        <LayoutGrid size={16} />
                        <span className="text-xs font-medium">Add elements</span>
                    </button>
                    <button className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${isDark ? 'bg-[#1e1e2e] border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                        <Music size={16} />
                        <span className="text-xs font-medium">Add audio</span>
                    </button>
                </div>

                {/* Right Side (Timeline scroll) */}
                <div className={`flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar rounded-lg ${isDark ? 'bg-[#14141d]' : 'bg-[#e8e8e8]'}`}>
                    <div
                        className="min-w-[800px] h-full relative"
                        ref={timelineRef}
                        onMouseDown={handleTimelineMouseDown}
                    >
                        {/* Playhead Marker */}
                        <div
                            className="absolute top-0 bottom-0 w-[2px] bg-gray-800 z-30 pointer-events-none"
                            style={{ left: `${(currentTime / 10) * 100}%` }}
                        >
                            {/* Playhead arrow at top */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-800" />
                            
                            {/* Floating time tooltip */}
                            <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                {currentTime.toFixed(1)}s
                            </div>
                        </div>

                        {/* Time Ruler */}
                        <div className="h-[24px] flex relative pointer-events-none border-b border-transparent">
                            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((sec) => (
                                <div
                                    key={sec}
                                    className="absolute top-0 bottom-0 flex items-end pb-1 pointer-events-none"
                                    style={{ left: `${sec}%` }}
                                >
                                    {/* Tick mark */}
                                    <div className={`absolute top-0 w-px h-1.5 left-0 -translate-x-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                                    
                                    <span className={`text-[10px] font-medium select-none -translate-x-1/2 absolute top-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {(sec / 10)}s
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Track Container (Empty State / Elements) */}
                        <div className="w-full h-[calc(100%-24px)] flex items-center justify-center pointer-events-none">
                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>or drag and drop media</span>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};
