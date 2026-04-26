import { create } from 'zustand';
import { travel } from 'zustand-travel';
import type { ManualTravelsControls } from 'zustand-travel';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TimelineScene = {
    id: string;
    duration: number;
    leadingGap?: number;
};

// ─── Keyframe type ────────────────────────────────────────────────────────────

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';

export type Keyframe = {
    frame: number;
    value: number;
    easing?: EasingType;
};

export type AnimatedProperty = {
    property: 'x' | 'y' | 'opacity' | 'rotation' | 'scaleX' | 'scaleY' | 'width' | 'height';
    keyframes: Keyframe[];
};

// ─── Serializable value type ─────────────────────────────────────────────────
// Enforces compile-time safety: only plain JSON-compatible values are allowed
// inside element props. Prevents functions, DOM nodes, and class instances
// from accidentally entering Zustand state and breaking database saves.
export type SerializableValue =
    | string
    | number
    | boolean
    | null
    | SerializableValue[]
    | { [key: string]: SerializableValue };

// ─── Element type ────────────────────────────────────────────────────────────

export type CanvasElement = {
    id: string;

    // Element category type — extend this union as you add more element types
    type: 'text' | 'device' | 'card' | '3d' | 'chart' | 'counter' | 'button' | 'icon' | 'shape' | 'list' | 'searchBar' | 'notification';

    // ─── Transform (raw numbers, NOT css strings) ─────────────────────────
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;      // degrees
    scaleX: number;        // 1 = normal
    scaleY: number;        // 1 = normal
    opacity: number;       // 0 to 1

    // ─── Stacking ─────────────────────────────────────────────────────────
    zIndex?: number;

    // ─── Parenting system ─────────────────────────────────────────────────
    // If parentId is set, this element's final x/y is calculated as:
    // finalX = this.x + parent.x
    // finalY = this.y + parent.y
    parentId: string | null;

    // ─── Schema-driven props ──────────────────────────────────────────────
    // Tightened from Record<string, any> to Record<string, SerializableValue>.
    // This enforces compile-time safety — functions and class instances are
    // rejected by TypeScript before they can reach Zustand.
    props: Record<string, SerializableValue>;

    // ─── Keyframe animations ──────────────────────────────────────────────
    // Each AnimatedProperty holds keyframes for one animatable property
    // Example: opacity goes from 0 at frame 0 to 1 at frame 30
    animations: AnimatedProperty[];

    // ─── Content ──────────────────────────────────────────────────────────
    content?: string; // text string or URL for image/video

    // ─── Bounding size ────────────────────────────────────────────────────
    // Used by CanvaBoundingBox for selection outline before scale is applied
    boundingSize?: [number, number];
};

// ─── CSS Matrix Parser ────────────────────────────────────────────────────────

/**
 * Parses a CSS transform string from react-moveable into raw numbers.
 * react-moveable outputs strings like: "translate(150px, 200px) rotate(45deg) scale(1.2, 1)"
 * or matrix format: "matrix(a, b, c, d, tx, ty)"
 * We extract raw x, y, rotation, scaleX, scaleY numbers for Zustand storage.
 */
export function parseTransformToNumbers(transform: string): {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
} {
    try {
        const matrix = new DOMMatrix(transform);
        const scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
        const scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
        const rotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        return {
            x: matrix.m41,
            y: matrix.m42,
            rotation,
            scaleX,
            scaleY,
        };
    } catch {
        return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    }
}

// ─── UI State Store (Non-Undoable) ──────────────────────────────────────────

interface UIState {
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;

    // Timeline state
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    currentTime: number;
    setCurrentTime: (time: number | ((prev: number) => number)) => void;

    // Canvas Settings
    canvasFormat: { width: number; height: number; ratio: string } | null;
    setCanvasFormat: (format: { width: number; height: number; ratio: string }) => void;
}

export const useUIStore = create<UIState>((set) => ({
    selectedId: null,
    setSelectedId: (id) => set({ selectedId: id }),

    isPlaying: false,
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    currentTime: 0,
    setCurrentTime: (time) => set((state) => ({
        currentTime: typeof time === 'function' ? time(state.currentTime) : time
    })),

    canvasFormat: null,
    setCanvasFormat: (format) => set({ canvasFormat: format }),
}));

// ─── Document State Store (Undoable) ──────────────────────────────────────────

interface EditorState {
    // UNDOABLE — stored as plain Record for 100% JSON serializability.
    // Record<id, element> gives identical O(1) lookups as Map in modern V8.
    // Unlike Map, JSON.stringify(Record) works correctly for database saves.
    elements: Record<string, CanvasElement>;
    elementIds: string[];

    // UNDOABLE — timeline scenes (shared undo/redo with elements)
    scenes: TimelineScene[];

    // Element Actions
    addElement: (element: CanvasElement) => void;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    removeElement: (id: string) => void;
    reorderElements: (oldIndex: number, newIndex: number) => void;

    // Scene Actions
    setScenes: (scenes: TimelineScene[] | ((prev: TimelineScene[]) => TimelineScene[])) => void;
    addScene: (scene: TimelineScene, atIndex?: number) => void;
    updateScene: (id: string, data: Partial<Omit<TimelineScene, 'id'>>) => void;
    removeScene: (id: string) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>()(
    travel(
        (set) => ({
            // Undoable state — plain Record, not Map, for JSON serializability
            elements: {} as Record<string, CanvasElement>,
            elementIds: [] as string[],
            scenes: [] as TimelineScene[],

            // Adds a new item to the canvas
            addElement: (element) => {
                set((state) => ({
                    elements: { ...state.elements, [element.id]: element },
                    elementIds: [...state.elementIds, element.id],
                    scenes: state.scenes,
                }));
            },

            // Updates an item's fields (position/rotation/scale/etc.)
            updateElement: (id, data) =>
                set((state) => {
                    const el = state.elements[id];
                    if (!el) return state;
                    return {
                        elements: { ...state.elements, [id]: { ...el, ...data } },
                        elementIds: state.elementIds,
                        scenes: state.scenes,
                    };
                }),

            // Removes an element from the canvas
            removeElement: (id) =>
                set((state) => {
                    const { [id]: removed, ...rest } = state.elements;
                    return {
                        elements: rest,
                        elementIds: state.elementIds.filter((eid) => eid !== id),
                        scenes: state.scenes,
                    };
                }),

            // Reorders elements
            reorderElements: (oldIndex, newIndex) =>
                set((state) => {
                    const ids = [...state.elementIds];
                    const [movedId] = ids.splice(oldIndex, 1);
                    ids.splice(newIndex, 0, movedId);

                    // Reconstruct the Record to reflect the new order
                    const newElements: Record<string, CanvasElement> = {};
                    ids.forEach(id => {
                        const el = state.elements[id];
                        if (el) newElements[id] = el;
                    });

                    return {
                        elementIds: ids,
                        elements: newElements,
                        scenes: state.scenes,
                    };
                }),

            // ─── Scene actions ────────────────────────────────────────────────

            // Replaces the entire scenes array (supports updater function)
            setScenes: (scenesOrFn) =>
                set((state) => ({
                    elements: state.elements,
                    elementIds: state.elementIds,
                    scenes: typeof scenesOrFn === 'function' ? scenesOrFn(state.scenes) : scenesOrFn,
                })),

            // Adds a scene at the end, or at a specific index
            addScene: (scene, atIndex) =>
                set((state) => {
                    const updated = [...state.scenes];
                    if (atIndex !== undefined) {
                        updated.splice(atIndex, 0, scene);
                    } else {
                        updated.push(scene);
                    }
                    return { elements: state.elements, elementIds: state.elementIds, scenes: updated };
                }),

            // Updates a single scene's fields by id
            updateScene: (id, data) =>
                set((state) => ({
                    elements: state.elements,
                    elementIds: state.elementIds,
                    scenes: state.scenes.map((s) =>
                        s.id === id ? { ...s, ...data } : s
                    ),
                })),

            // Removes a scene by id
            removeScene: (id) =>
                set((state) => ({
                    elements: state.elements,
                    elementIds: state.elementIds,
                    scenes: state.scenes.filter((s) => s.id !== id),
                })),
        }),
        {
            // Manual archive: we call controls.archive() ourselves on drag/scale end.
            // This means ONE checkpoint per gesture, not one per pixel.
            autoArchive: false,
            maxHistory: 50,
        }
    )
);

// ─── History controls ─────────────────────────────────────────────────────────

/**
 * Returns the zustand-travel controls object.
 * Call controls.archive() to save a history checkpoint.
 * Call controls.back() / controls.forward() for undo / redo.
 */
export function getHistoryControls(): ManualTravelsControls<EditorState, false> {
    // getControls is injected by the travel middleware onto the store.
    // Double-cast via unknown because the middleware wraps state in StoreApi<T>.
    return useEditorStore.getControls!() as unknown as ManualTravelsControls<EditorState, false>;
}


