import { useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { CanvasElement } from '../store/useEditorStore';
import { useEditorStore } from '../store/useEditorStore';

/** Grab the zundo temporal API without causing re-renders. */
function getTemporalStore() {
    return (useEditorStore as any).temporal.getState();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a pointer event's client coords into R3F world-space (X,Y) using
 *  the orthographic camera that has zoom=100 and looks straight down +Z. */
function clientToWorld(
    clientX: number,
    clientY: number,
    camera: THREE.OrthographicCamera,
    domElement: HTMLElement
): [number, number] {
    const rect = domElement.getBoundingClientRect();
    // NDC  (-1 … +1)
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Ortho camera: world = (ndc * half-extents) / zoom  + camera offset
    const halfW = (camera.right - camera.left) / 2;
    const halfH = (camera.top - camera.bottom) / 2;
    const worldX = ndcX * halfW + (camera.right + camera.left) / 2;
    const worldY = ndcY * halfH + (camera.top + camera.bottom) / 2;
    return [worldX, worldY];
}

// ─────────────────────────────────────────────────────────────────────────────
// Corner handle – dragging scales the element uniformly
// ─────────────────────────────────────────────────────────────────────────────

interface CornerHandleProps {
    localOffset: [number, number]; // position relative to element centre
    el: CanvasElement;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    /** Shared ref owned by CanvaBoundingBox – true while this handle is being dragged. */
    cornerDragActiveRef: React.MutableRefObject<boolean>;
}

function CornerHandle({ localOffset, el, updateElement, cornerDragActiveRef }: CornerHandleProps) {
    const { camera, gl } = useThree();
    const dragRef = useRef<{
        active: boolean;
        startDist: number;
        startScale: [number, number, number];
    } | null>(null);

    const onPointerDown = useCallback(
        (e: { nativeEvent: PointerEvent; stopPropagation: () => void }) => {
            e.stopPropagation();
            (e.nativeEvent.target as Element).setPointerCapture(e.nativeEvent.pointerId);

            // Pause history so every move pixel doesn't create a snapshot
            getTemporalStore().pause();
            cornerDragActiveRef.current = true;

            const [wx, wy] = clientToWorld(
                e.nativeEvent.clientX,
                e.nativeEvent.clientY,
                camera as THREE.OrthographicCamera,
                gl.domElement
            );
            const cx = el.position[0];
            const cy = el.position[1];
            const dist = Math.sqrt((wx - cx) ** 2 + (wy - cy) ** 2);

            dragRef.current = {
                active: true,
                startDist: dist || 0.001, // guard against divide-by-zero
                startScale: [...el.scale] as [number, number, number],
            };
        },
        [camera, gl, el, cornerDragActiveRef]
    );

    const onPointerMove = useCallback(
        (e: { nativeEvent: PointerEvent }) => {
            if (!dragRef.current?.active) return;
            const { startDist, startScale } = dragRef.current;

            const [wx, wy] = clientToWorld(
                e.nativeEvent.clientX,
                e.nativeEvent.clientY,
                camera as THREE.OrthographicCamera,
                gl.domElement
            );
            const cx = el.position[0];
            const cy = el.position[1];
            const dist = Math.sqrt((wx - cx) ** 2 + (wy - cy) ** 2);

            const ratio = dist / startDist;
            const newScale = Math.max(0.05, startScale[0] * ratio);
            updateElement(el.id, { scale: [newScale, newScale, 1] });
        },
        [camera, gl, el, updateElement]
    );

    const onPointerUp = useCallback(
        (e: { nativeEvent: PointerEvent }) => {
            if (!dragRef.current) return;
            dragRef.current.active = false;
            cornerDragActiveRef.current = false;
            (e.nativeEvent.target as Element).releasePointerCapture(e.nativeEvent.pointerId);
            // Resume history – zundo records ONE snapshot for the whole scale drag
            getTemporalStore().resume();
        },
        [cornerDragActiveRef]
    );

    return (
        <mesh
            position={[localOffset[0], localOffset[1], 0.01]}
            onPointerDown={onPointerDown as any}
            onPointerMove={onPointerMove as any}
            onPointerUp={onPointerUp as any}
        >
            {/* Small circular handle */}
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color="#ffffff" />
            {/* Purple ring / border */}
            <mesh>
                <ringGeometry args={[0.042, 0.055, 16]} />
                <meshBasicMaterial color="#7c3aed" />
            </mesh>
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Border – a line-loop drawn from four corner points
// ─────────────────────────────────────────────────────────────────────────────

function SelectionBorder({ w, h }: { w: number; h: number }) {
    const hw = w / 2;
    const hh = h / 2;
    const points: [number, number, number][] = [
        [-hw, -hh, 0],
        [ hw, -hh, 0],
        [ hw,  hh, 0],
        [-hw,  hh, 0],
        [-hw, -hh, 0], // close the loop
    ];
    return <Line points={points} color="#7c3aed" lineWidth={2} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export interface CanvaBoundingBoxProps {
    el: CanvasElement;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
}

/**
 * CanvaBoundingBox – Canva-style 2-D selection overlay for a canvas element.
 *
 * It renders:
 *   • A purple rectangular border matching the element's scaled bounds
 *   • 4 white corner scale handles
 *   • An invisible drag-surface covering the whole element for move interactions
 *
 * It works with an orthographic camera (zoom=100) and does NOT use TransformControls.
 */
export function CanvaBoundingBox({ el, updateElement }: CanvaBoundingBoxProps) {
    const { camera, gl } = useThree();

    const [cx, cy, cz] = el.position;
    const [sx, sy] = el.scale; // scale applied to the element itself

    // Use the element's declared bounding size (world units before scale) if present.
    // Fall back to text defaults [3, 0.4] so existing text elements are unaffected.
    const [BASE_W, BASE_H] = el.boundingSize ?? [3, 0.4];

    const w = BASE_W * sx;
    const h = BASE_H * sy;
    const hw = w / 2;
    const hh = h / 2;

    // ── Move drag state ──────────────────────────────────────────────────────
    const moveDragRef = useRef<{
        active: boolean;
        startPointer: [number, number];
        startPos: [number, number, number];
    } | null>(null);

    // Shared flag so the window safety-valve below can see whether ANY corner handle
    // is currently being dragged (CornerHandle owns its own dragRef internally).
    const cornerDragActiveRef = useRef<boolean>(false);

    // ── Safety valve: resume history if OS swallows the pointerup ────────────
    // Alt-Tab, system dialogs, or screen-lock can kill the pointer capture so
    // onPointerUp never fires, leaving zundo permanently paused.
    useEffect(() => {
        const handleWindowPointerUp = () => {
            const moveActive = moveDragRef.current?.active ?? false;
            const cornerActive = cornerDragActiveRef.current;

            if (moveActive || cornerActive) {
                // Reset both drag states
                if (moveDragRef.current) moveDragRef.current.active = false;
                cornerDragActiveRef.current = false;
                // Un-pause history so Ctrl+Z works correctly after the interrupted drag
                getTemporalStore().resume();
            }
        };

        window.addEventListener('pointerup', handleWindowPointerUp);
        return () => window.removeEventListener('pointerup', handleWindowPointerUp);
    }, []); // refs are stable—no deps needed

    const onMovePointerDown = useCallback(
        (e: { nativeEvent: PointerEvent; stopPropagation: () => void }) => {
            e.stopPropagation();
            (e.nativeEvent.target as Element).setPointerCapture(e.nativeEvent.pointerId);

            // Pause history so every move pixel doesn't create a snapshot
            getTemporalStore().pause();

            const [wx, wy] = clientToWorld(
                e.nativeEvent.clientX,
                e.nativeEvent.clientY,
                camera as THREE.OrthographicCamera,
                gl.domElement
            );
            moveDragRef.current = {
                active: true,
                startPointer: [wx, wy],
                startPos: [...el.position] as [number, number, number],
            };
        },
        [camera, gl, el]
    );

    const onMovePointerMove = useCallback(
        (e: { nativeEvent: PointerEvent }) => {
            if (!moveDragRef.current?.active) return;
            const { startPointer, startPos } = moveDragRef.current;

            const [wx, wy] = clientToWorld(
                e.nativeEvent.clientX,
                e.nativeEvent.clientY,
                camera as THREE.OrthographicCamera,
                gl.domElement
            );
            const dx = wx - startPointer[0];
            const dy = wy - startPointer[1];
            updateElement(el.id, {
                position: [startPos[0] + dx, startPos[1] + dy, startPos[2]],
            });
        },
        [camera, gl, el, updateElement]
    );

    const onMovePointerUp = useCallback(
        (e: { nativeEvent: PointerEvent }) => {
            if (!moveDragRef.current) return;
            moveDragRef.current.active = false;
            (e.nativeEvent.target as Element).releasePointerCapture(e.nativeEvent.pointerId);
            // Resume history – zundo records ONE snapshot for the whole move drag
            getTemporalStore().resume();
        },
        []
    );

    // The four corner offsets in LOCAL space (relative to element centre)
    const corners: [number, number][] = [
        [-hw, -hh], // bottom-left
        [hw, -hh],  // bottom-right
        [hw, hh],   // top-right
        [-hw, hh],  // top-left
    ];

    return (
        <group position={[cx, cy, cz]}>
            {/* ── 1. Purple border outline ── */}
            <SelectionBorder w={w} h={h} />

            {/* ── 2. Corner scale handles ── */}
            {corners.map(([ox, oy], i) => (
                <CornerHandle
                    key={i}
                    localOffset={[ox, oy]}
                    el={el}
                    updateElement={updateElement}
                    cornerDragActiveRef={cornerDragActiveRef}
                />
            ))}

            {/* ── 3. Invisible move drag surface (must be last so it's on top of border) ── */}
            <mesh
                onPointerDown={onMovePointerDown as any}
                onPointerMove={onMovePointerMove as any}
                onPointerUp={onMovePointerUp as any}
            >
                <planeGeometry args={[w, h]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
        </group>
    );
}
