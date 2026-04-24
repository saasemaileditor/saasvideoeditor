import React, { useEffect, useRef } from 'react';
import Moveable from 'react-moveable';
import type { OnDrag, OnScale, OnRotate } from 'react-moveable';
import type { CanvasElement } from '../store/useEditorStore';
import { getHistoryControls, parseTransformToNumbers } from '../store/useEditorStore';
// Raw SVG import — zero React overhead, pure CSS injection for canvas performance
import refreshCwRaw from 'lucide-static/icons/refresh-cw.svg?raw';

// Modify the raw SVG: slightly increase stroke-width to 1.5 for better visibility
const thinRefreshCw = refreshCwRaw.replace(/stroke-width="[^"]+"/g, 'stroke-width="1.5"');

// Encode once at module load (not on every render)
const ROTATE_ICON_URL = `url("data:image/svg+xml,${encodeURIComponent(thinRefreshCw)}")`;

export interface CanvaBoundingBoxProps {
    el: CanvasElement;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    containerRef: React.RefObject<HTMLElement | null>;
    targetRef: React.RefObject<HTMLElement | null>;
}

const lockCursor = (cursorStyle: string) => {
    document.body.style.setProperty('cursor', cursorStyle, 'important');
    let styleEl = document.getElementById('canva-cursor-lock');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'canva-cursor-lock';
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `* { cursor: ${cursorStyle} !important; }`;
};

const unlockCursor = () => {
    document.body.style.removeProperty('cursor');
    const styleEl = document.getElementById('canva-cursor-lock');
    if (styleEl) styleEl.remove();
};

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
    // Tracks the raw transform string during drag for live DOM update
    const liveTransformRef = useRef<string>('');

    const handleDragStart = () => {
        lockCursor('move');
        pendingUpdatesRef.current = null;
    };

    const handleScaleStart = (e: any) => {
        let cursor = 'nwse-resize';
        const [dx, dy] = e.direction;
        if (dx === 0 && dy !== 0) cursor = 'ns-resize';
        else if (dx !== 0 && dy === 0) cursor = 'ew-resize';
        else if ((dx === 1 && dy === -1) || (dx === -1 && dy === 1)) cursor = 'nesw-resize';
        else cursor = 'nwse-resize';

        lockCursor(cursor);
        pendingUpdatesRef.current = null;
    };

    const handleRotateStart = () => {
        lockCursor('grabbing');
        pendingUpdatesRef.current = null;
    };

    const handleDrag = (e: OnDrag) => {
        // Live DOM update — bypasses React for 60fps smoothness
        e.target.style.transform = e.transform;
        liveTransformRef.current = e.transform;

        const parsed = parseTransformToNumbers(e.transform);
        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            x: parsed.x,
            y: parsed.y,
        };
    };

    const handleScale = (e: OnScale) => {
        // Live DOM update
        e.target.style.transform = e.drag.transform;
        liveTransformRef.current = e.drag.transform;

        const parsed = parseTransformToNumbers(e.drag.transform);
        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            x: parsed.x,
            y: parsed.y,
            scaleX: parsed.scaleX,
            scaleY: parsed.scaleY,
        };
    };

    const handleRotate = (e: OnRotate) => {
        // Live DOM update
        e.target.style.transform = e.drag.transform;
        liveTransformRef.current = e.drag.transform;

        const parsed = parseTransformToNumbers(e.drag.transform);
        pendingUpdatesRef.current = {
            ...pendingUpdatesRef.current,
            x: parsed.x,
            y: parsed.y,
            rotation: parsed.rotation,
        };
    };

    const handleEnd = () => {
        unlockCursor();
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
                    width: 12.5px !important;
                    height: 12.5px !important;
                    margin-top: -6.25px !important;
                    margin-left: -6.25px !important;
                    border-radius: 50% !important;
                    transition: background-color 0.15s ease !important;
                }
                /* Explicitly targeting only the 8 resize directions for the purple hover effect */
                .canva-moveable-style .moveable-control.moveable-nw:hover, .canva-moveable-style .moveable-control.moveable-nw:active,
                .canva-moveable-style .moveable-control.moveable-ne:hover, .canva-moveable-style .moveable-control.moveable-ne:active,
                .canva-moveable-style .moveable-control.moveable-sw:hover, .canva-moveable-style .moveable-control.moveable-sw:active,
                .canva-moveable-style .moveable-control.moveable-se:hover, .canva-moveable-style .moveable-control.moveable-se:active,
                .canva-moveable-style .moveable-control.moveable-n:hover,  .canva-moveable-style .moveable-control.moveable-n:active,
                .canva-moveable-style .moveable-control.moveable-s:hover,  .canva-moveable-style .moveable-control.moveable-s:active,
                .canva-moveable-style .moveable-control.moveable-w:hover,  .canva-moveable-style .moveable-control.moveable-w:active,
                .canva-moveable-style .moveable-control.moveable-e:hover,  .canva-moveable-style .moveable-control.moveable-e:active {
                    background: #7c3aed !important;
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
                    width: 24px !important;
                    height: 24px !important;
                    border-radius: 50% !important;
                    background: #fff !important;
                    border: 1px solid #d1d5db !important;
                    box-shadow: none !important;
                    background-image: ${ROTATE_ICON_URL} !important;
                    background-repeat: no-repeat !important;
                    background-position: center !important;
                    background-size: 14px 14px !important;
                    margin-top: -12px !important;
                    margin-left: -12px !important;
                    cursor: grab !important;
                    transition: background-color 0.15s ease !important;
                }
                .canva-moveable-style .moveable-rotation-control:active {
                    cursor: grabbing !important;
                }
                .canva-moveable-style .moveable-rotation-control:hover {
                    background-color: #f9fafb !important;
                    background-image: ${ROTATE_ICON_URL} !important;
                    background-repeat: no-repeat !important;
                    background-position: center !important;
                    background-size: 14px 14px !important;
                }
                .canva-moveable-style .moveable-rotation-line {
                    display: none !important;
                }
                .canva-moveable-style .moveable-line {
                    background: #7c3aed !important;
                    box-shadow: 0 0 0 0.5px #7c3aed !important; /* Thickens the boundary lines just a bit */
                }
            `}</style>
            <Moveable
                ref={moveableRef}
                target={target}
                container={null}
                getContainer={() => containerRef.current as HTMLElement}

                // Styles
                className="canva-moveable-style"
                origin={false}
                edge={false}

                // Dragging
                draggable={true}
                throttleDrag={0}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleEnd}

                // Scaling instead of Resizing to use CSS transform strings
                scalable={true}
                throttleScale={0}
                // All 8 directions based on Canva request
                renderDirections={["nw", "ne", "sw", "se", "w", "e", "n", "s"]}
                onScaleStart={handleScaleStart}
                onScale={handleScale}
                onScaleEnd={handleEnd}

                // Rotating
                rotatable={true}
                throttleRotate={0}
                rotationPosition="right"
                onRotateStart={handleRotateStart}
                onRotate={handleRotate}
                onRotateEnd={handleEnd}

                // Snapping & Guidelines (Pink Lines)
                snappable={true}
                snapDirections={{ "top": true, "center": true, "bottom": true, "left": true, "middle": true, "right": true }}
                elementGuidelines={[]}
                snapThreshold={5}
                isDisplaySnapDigit={true}
                snapGap={true}
            />
        </>
    );
}
