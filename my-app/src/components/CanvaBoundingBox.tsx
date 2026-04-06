import { useRef, useCallback, useEffect, useMemo } from 'react';
import type { CanvasElement } from '../store/useEditorStore';
import { getHistoryControls, useUIStore } from '../store/useEditorStore';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a pointer event's client coords relative to a parent container
 *  into pixel coordinates within that container. */
function clientToLocal(
    clientX: number,
    clientY: number,
    container: HTMLElement
): [number, number] {
    const rect = container.getBoundingClientRect();
    return [clientX - rect.left, clientY - rect.top];
}

// ─────────────────────────────────────────────────────────────────────────────
// Corner handle – dragging scales the element uniformly
// ─────────────────────────────────────────────────────────────────────────────

type CursorCorner = 'nwse-resize' | 'nesw-resize';

interface CornerHandleProps {
    /** CSS position for this handle (e.g. top/left/right/bottom) */
    style: React.CSSProperties;
    cursor: CursorCorner;
    el: CanvasElement;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    /** Shared ref – true while this handle is being dragged. */
    cornerDragActiveRef: React.MutableRefObject<boolean>;
    /** Container element for coordinate conversion. */
    containerRef: React.RefObject<HTMLElement | null>;
}

function CornerHandle({
    style,
    cursor,
    el,
    updateElement,
    cornerDragActiveRef,
    containerRef,
}: CornerHandleProps) {
    const dragRef = useRef<{
        active: boolean;
        startDist: number;
        startScale: [number, number, number];
    } | null>(null);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation();
            e.preventDefault();
            (e.target as Element).setPointerCapture(e.pointerId);
            cornerDragActiveRef.current = true;

            if (!containerRef.current) return;
            const [lx, ly] = clientToLocal(e.clientX, e.clientY, containerRef.current);
            const cx = el.position[0];
            const cy = el.position[1];
            const dist = Math.sqrt((lx - cx) ** 2 + (ly - cy) ** 2);

            dragRef.current = {
                active: true,
                startDist: dist || 1,
                startScale: [...el.scale] as [number, number, number],
            };
        },
        [el, cornerDragActiveRef, containerRef]
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragRef.current?.active || !containerRef.current) return;
            const { startDist, startScale } = dragRef.current;

            const [lx, ly] = clientToLocal(e.clientX, e.clientY, containerRef.current);
            const cx = el.position[0];
            const cy = el.position[1];
            const dist = Math.sqrt((lx - cx) ** 2 + (ly - cy) ** 2);

            const ratio = dist / startDist;
            const newScale = Math.max(0.1, startScale[0] * ratio);
            updateElement(el.id, { scale: [newScale, newScale, 1] });
        },
        [el, updateElement, containerRef]
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (!dragRef.current) return;
            dragRef.current.active = false;
            cornerDragActiveRef.current = false;
            (e.target as Element).releasePointerCapture(e.pointerId);
            getHistoryControls().archive();
            window.dispatchEvent(new CustomEvent('history-updated'));
        },
        [cornerDragActiveRef]
    );

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#ffffff',
                border: '2px solid #7c3aed',
                cursor,
                zIndex: 10,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
                ...style,
            }}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export interface CanvaBoundingBoxProps {
    el: CanvasElement;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    /** The parent container element for coordinate conversions */
    containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * CanvaBoundingBox – Canva-style 2-D selection overlay for a canvas element.
 *
 * It renders:
 *   • A purple rectangular border matching the element's scaled bounds
 *   • 4 white corner scale handles
 *   • An invisible drag-surface covering the whole element for move interactions
 *
 * Now uses pure CSS/HTML instead of Three.js meshes.
 */
export function CanvaBoundingBox({ el, updateElement, containerRef }: CanvaBoundingBoxProps) {
    const { setSelectedId } = useUIStore();

    const elementRef = useRef(el);
    elementRef.current = el;

    const onElementClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedId(elementRef.current.id);
        },
        [setSelectedId]
    );

    const [px, py] = el.position; // pixel position (center of element)
    const [sx, sy] = el.scale;

    const dimensions = useMemo(() => {
        const [BASE_W, BASE_H] = el.boundingSize ?? [150, 40];
        const w = BASE_W * sx;
        const h = BASE_H * sy;
        return { w, h };
    }, [el.boundingSize, sx, sy]);

    const { w, h } = dimensions;

    // ── Move drag state ──────────────────────────────────────────────────────
    const moveDragRef = useRef<{
        active: boolean;
        startPointer: [number, number];
        startPos: [number, number, number];
    } | null>(null);

    const cornerDragActiveRef = useRef<boolean>(false);

    // ── Safety valve: archive history if OS swallows the pointerup ───────────
    useEffect(() => {
        const handleWindowPointerUp = () => {
            const moveActive = moveDragRef.current?.active ?? false;
            const cornerActive = cornerDragActiveRef.current;

            if (moveActive || cornerActive) {
                if (moveDragRef.current) moveDragRef.current.active = false;
                cornerDragActiveRef.current = false;
                getHistoryControls().archive();
                window.dispatchEvent(new CustomEvent('history-updated'));
            }
        };

        window.addEventListener('pointerup', handleWindowPointerUp);
        return () => window.removeEventListener('pointerup', handleWindowPointerUp);
    }, []);

    const onMovePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation();
            (e.target as Element).setPointerCapture(e.pointerId);

            if (!containerRef.current) return;
            const [lx, ly] = clientToLocal(e.clientX, e.clientY, containerRef.current);
            moveDragRef.current = {
                active: true,
                startPointer: [lx, ly],
                startPos: [...el.position] as [number, number, number],
            };
        },
        [el.position, containerRef]
    );

    const onMovePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!moveDragRef.current?.active || !containerRef.current) return;
            const { startPointer, startPos } = moveDragRef.current;

            const [lx, ly] = clientToLocal(e.clientX, e.clientY, containerRef.current);
            const dx = lx - startPointer[0];
            const dy = ly - startPointer[1];
            updateElement(el.id, {
                position: [startPos[0] + dx, startPos[1] + dy, startPos[2]],
            });
        },
        [el.id, updateElement, containerRef]
    );

    const onMovePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (!moveDragRef.current) return;
            moveDragRef.current.active = false;
            (e.target as Element).releasePointerCapture(e.pointerId);
            getHistoryControls().archive();
            window.dispatchEvent(new CustomEvent('history-updated'));
        },
        []
    );

    // The overlay is positioned so that (px, py) is the element center
    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        left: px - w / 2,
        top: py - h / 2,
        width: w,
        height: h,
        border: '2px solid #7c3aed',
        borderRadius: 4,
        pointerEvents: 'auto',
        touchAction: 'none',
        zIndex: 50,
    };

    return (
        <div style={overlayStyle} onClick={onElementClick}>
            {/* Invisible move drag surface */}
            <div
                onPointerDown={onMovePointerDown}
                onPointerMove={onMovePointerMove}
                onPointerUp={onMovePointerUp}
                style={{
                    position: 'absolute',
                    inset: 0,
                    cursor: 'move',
                    touchAction: 'none',
                }}
            />

            {/* Corner handles */}
            <CornerHandle
                style={{ top: 0, left: 0 }}
                cursor="nwse-resize"
                el={el}
                updateElement={updateElement}
                cornerDragActiveRef={cornerDragActiveRef}
                containerRef={containerRef}
            />
            <CornerHandle
                style={{ top: 0, right: -1, left: 'auto', transform: 'translate(50%, -50%)' }}
                cursor="nesw-resize"
                el={el}
                updateElement={updateElement}
                cornerDragActiveRef={cornerDragActiveRef}
                containerRef={containerRef}
            />
            <CornerHandle
                style={{ bottom: -1, right: -1, top: 'auto', left: 'auto', transform: 'translate(50%, 50%)' }}
                cursor="nwse-resize"
                el={el}
                updateElement={updateElement}
                cornerDragActiveRef={cornerDragActiveRef}
                containerRef={containerRef}
            />
            <CornerHandle
                style={{ bottom: -1, left: 0, top: 'auto', transform: 'translate(-50%, 50%)' }}
                cursor="nesw-resize"
                el={el}
                updateElement={updateElement}
                cornerDragActiveRef={cornerDragActiveRef}
                containerRef={containerRef}
            />
        </div>
    );
}
