import React, { useEffect, useState, useRef } from 'react';
import Moveable from 'react-moveable';
import type { OnDrag, OnResize, OnRotate } from 'react-moveable';
import type { CanvasElement } from '../store/useEditorStore';
import { getHistoryControls } from '../store/useEditorStore';

export interface CanvaBoundingBoxProps {
    el: CanvasElement;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    containerRef: React.RefObject<HTMLElement | null>;
}

export function CanvaBoundingBox({ el, updateElement, containerRef }: CanvaBoundingBoxProps) {
    const targetSelector = `.canvas-element-${el.id}`;
    const [target, setTarget] = useState<HTMLElement | null>(null);

    // Initial mount to find target DOM node
    useEffect(() => {
        // Use a short timeout to ensure the DOM element has rendered if it just mounted
        const timer = setTimeout(() => {
            const t = document.querySelector(targetSelector) as HTMLElement | null;
            if (t) setTarget(t);
        }, 10);
        return () => clearTimeout(timer);
    }, [targetSelector]);

    // Keep track of state at the start of a drag/resize/rotate 
    // so we can compute absolute values linearly without React state lag
    const dragStartRef = useRef<{ pos: [number, number]; scale: [number, number]; rot: number } | null>(null);
    const pendingUpdatesRef = useRef<Partial<CanvasElement> | null>(null);

    const handleStart = () => {
        dragStartRef.current = {
            pos: [el.position[0], el.position[1]],
            scale: [el.scale[0], el.scale[1]],
            rot: el.rotation?.[2] ?? 0
        };
        pendingUpdatesRef.current = null;
    };

    const handleDrag = (e: OnDrag) => {
        if (!dragStartRef.current) return;
        const [startX, startY] = dragStartRef.current.pos;
        
        // Direct DOM update to bypass React state cycle (fixes trailing box lag)
        e.target.style.transform = e.transform;

        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            position: [startX + e.beforeTranslate[0], startY + e.beforeTranslate[1], 0]
        };
    };

    const handleResize = (e: OnResize) => {
        if (!dragStartRef.current) return;
        
        // Direct DOM Update for jitter-free 60FPS resize
        e.target.style.width = `${e.width}px`;
        e.target.style.height = `${e.height}px`;
        e.target.style.transform = e.drag.transform;

        // Compute absolute new center for Zustand using top-left expansion math
        const [BASE_W, BASE_H] = el.boundingSize ?? [200, 60];
        const [startSx, startSy] = dragStartRef.current.scale;
        
        const oldW = BASE_W * startSx;
        const oldH = BASE_H * startSy;
        const newW = e.width;
        const newH = e.height;

        const [startX, startY] = dragStartRef.current.pos;

        // Moveable shifts the top-left corner by e.drag.beforeTranslate.
        // And the element expands by (newW - oldW). This shifts the center rightwards.
        const newCenterX = startX + e.drag.beforeTranslate[0] + (newW - oldW) / 2;
        const newCenterY = startY + e.drag.beforeTranslate[1] + (newH - oldH) / 2;

        const newSx = newW / BASE_W;
        const newSy = newH / BASE_H;

        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            scale: [newSx, newSy, 1],
            position: [newCenterX, newCenterY, 0]
        };
    };

    const handleRotate = (e: OnRotate) => {
        if (!dragStartRef.current) return;
        
        // Direct DOM Update
        e.target.style.transform = e.drag.transform;

        const startRot = dragStartRef.current.rot;
        
        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            rotation: [0, 0, startRot + e.beforeRotate]
        };
    };

    const handleEnd = () => {
        // "Write to the heavy notebook" ONLY when the mouse releases
        if (pendingUpdatesRef.current) {
            updateElement(el.id, pendingUpdatesRef.current);
            pendingUpdatesRef.current = null;
        }
        getHistoryControls().archive();
        window.dispatchEvent(new CustomEvent('history-updated'));
    };

    if (!target) return null;

    return (
        <>
            <style>{`
                .canva-moveable-style {
                    --moveable-color: #7c3aed !important; 
                }
                .canva-moveable-style .moveable-control {
                    background: #fff !important;
                    border: 2px solid #7c3aed !important;
                    width: 14px !important;
                    height: 14px !important;
                    margin-top: -7px !important;
                    margin-left: -7px !important;
                }
                .canva-moveable-style .moveable-control.moveable-w,
                .canva-moveable-style .moveable-control.moveable-e {
                    height: 24px !important;
                    border-radius: 12px !important;
                    margin-top: -12px !important;
                }
                .canva-moveable-style .moveable-control.moveable-n,
                .canva-moveable-style .moveable-control.moveable-s {
                    width: 24px !important;
                    border-radius: 12px !important;
                    margin-left: -12px !important;
                }
                .canva-moveable-style .moveable-rotation-control {
                    border-radius: 50% !important;
                }
                .canva-moveable-style .moveable-line {
                    background: #7c3aed !important;
                }
            `}</style>
            <Moveable
                target={target}
                container={containerRef.current}

                // Styles
                className="canva-moveable-style"
                origin={false}
                edge={false}

                // Dragging
                draggable={true}
                throttleDrag={0}
                onDragStart={handleStart}
                onDrag={handleDrag}
                onDragEnd={handleEnd}

                // Resizing
                resizable={true}
                throttleResize={0}
                // All 8 directions based on Canva request
                renderDirections={["nw", "ne", "sw", "se", "w", "e", "n", "s"]}
                onResizeStart={handleStart}
                onResize={handleResize}
                onResizeEnd={handleEnd}

                // Rotating
                rotatable={true}
                throttleRotate={0}
                rotationPosition="top"
                onRotateStart={handleStart}
                onRotate={handleRotate}
                onRotateEnd={handleEnd}

                // Snapping & Guidelines (Pink Lines)
                snappable={true}
                snapDirections={{ "top": true, "center": true, "bottom": true, "left": true, "middle": true, "right": true }}
                elementGuidelines={[{ element: containerRef.current, className: 'canvas' }]}
                snapThreshold={5}
                isDisplaySnapDigit={true}
                snapGap={true}
            />
        </>
    );
}
