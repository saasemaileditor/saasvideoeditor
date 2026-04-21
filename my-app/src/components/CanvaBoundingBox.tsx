import React, { useEffect, useRef } from 'react';
import Moveable from 'react-moveable';
import type { OnDrag, OnScale, OnRotate } from 'react-moveable';
import type { CanvasElement } from '../store/useEditorStore';
import { getHistoryControls } from '../store/useEditorStore';

export interface CanvaBoundingBoxProps {
    el: CanvasElement;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    containerRef: React.RefObject<HTMLElement | null>;
    targetRef: React.RefObject<HTMLElement | null>;
}

export function CanvaBoundingBox({ el, updateElement, containerRef, targetRef }: CanvaBoundingBoxProps) {
    const target = targetRef?.current;
    const moveableRef = useRef<any>(null);

    // Initial mount: update rect directly since target is provided by React
    useEffect(() => {
        if (moveableRef.current) {
            moveableRef.current.updateRect();
        }
    }, [target]);

    const pendingUpdatesRef = useRef<Partial<CanvasElement> | null>(null);

    const handleStart = () => {
        pendingUpdatesRef.current = null;
    };

    const handleDrag = (e: OnDrag) => {
        // Direct DOM update to bypass React state cycle
        e.target.style.transform = e.transform;

        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            transform: e.transform
        };
    };

    const handleScale = (e: OnScale) => {
        // Direct DOM Update for jitter-free 60FPS scale
        e.target.style.transform = e.drag.transform;

        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            transform: e.drag.transform
        };
    };

    const handleRotate = (e: OnRotate) => {
        // Direct DOM Update
        e.target.style.transform = e.drag.transform;

        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            transform: e.drag.transform
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
                    border: 1px solid #6b7280 !important;
                    width: 10px !important;
                    height: 10px !important;
                    margin-top: -5px !important;
                    margin-left: -5px !important;
                    border-radius: 50% !important;
                }
                .canva-moveable-style .moveable-control.moveable-w,
                .canva-moveable-style .moveable-control.moveable-e {
                    width: 8px !important;
                    height: 20px !important;
                    border-radius: 4px !important;
                    margin-top: -10px !important;
                    margin-left: -4px !important;
                }
                .canva-moveable-style .moveable-control.moveable-n,
                .canva-moveable-style .moveable-control.moveable-s {
                    width: 20px !important;
                    height: 8px !important;
                    border-radius: 4px !important;
                    margin-left: -10px !important;
                    margin-top: -4px !important;
                }
                .canva-moveable-style .moveable-rotation-control {
                    border-radius: 50% !important;
                }
                .canva-moveable-style .moveable-line {
                    background: #7c3aed !important;
                }
            `}</style>
            <Moveable
                ref={moveableRef}
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

                // Scaling instead of Resizing to use CSS transform strings
                scalable={true}
                throttleScale={0}
                // All 8 directions based on Canva request
                renderDirections={["nw", "ne", "sw", "se", "w", "e", "n", "s"]}
                onScaleStart={handleStart}
                onScale={handleScale}
                onScaleEnd={handleEnd}

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
