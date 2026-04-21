import { create } from 'zustand';
import { travel } from 'zustand-travel';
import type { ManualTravelsControls } from 'zustand-travel';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TimelineScene = {
    id: string;
    duration: number;
    leadingGap?: number;
};

// ─── Element type ────────────────────────────────────────────────────────────

export type CanvasElement = {
    id: string;
    type: 'text' | 'device' | 'card' | '3d' | 'chart' | 'counter' | 'button' | 'icon' | 'shape' | 'list' | 'searchBar' | 'notification';
    transform: string;
    zIndex?: number;
    content?: string; // Holds the text string, or a URL for an image/video
    /**
     * Base bounding size in world units *before* scale is applied — [width, height].
     * Used by CanvaBoundingBox to draw a correctly-sized selection outline.
     * Omit for text elements; the bounding box falls back to [3, 0.4].
     */
    boundingSize?: [number, number];
    props?: Record<string, any>; // Store element-specific properties
};

// ─── UI State Store (Non-Undoable) ──────────────────────────────────────────

interface UIState {
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    
    // Timeline state
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    currentTime: number;
    setCurrentTime: (time: number | ((prev: number) => number)) => void;

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

}));

// ─── Document State Store (Undoable) ──────────────────────────────────────────

interface EditorState {
    // UNDOABLE — stored as Map for O(1) lookups + insertion-ordered id list
    elements: Map<string, CanvasElement>;
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
            // Undoable state
            elements: new Map<string, CanvasElement>(),
            elementIds: [] as string[],
            scenes: [] as TimelineScene[],

            // Adds a new item to the canvas and selects it
            addElement: (element) =>
                set((state) => ({
                    elements: new Map([...state.elements, [element.id, element]]),
                    elementIds: [...state.elementIds, element.id],
                    scenes: state.scenes,
                })),

            // Updates an item's fields (position/rotation/scale/etc.)
            updateElement: (id, data) =>
                set((state) => {
                    const el = state.elements.get(id);
                    if (!el) return state;
                    return {
                        elements: new Map([...state.elements, [id, { ...el, ...data }]]),
                        elementIds: state.elementIds,
                        scenes: state.scenes,
                    };
                }),

            // Removes an element from the canvas
            removeElement: (id) =>
                set((state) => {
                    const newElements = new Map(state.elements);
                    newElements.delete(id);
                    return {
                        elements: newElements,
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
                    
                    // Reconstruct the Map to reflect the new order
                    const newElements = new Map<string, CanvasElement>();
                    ids.forEach(id => {
                        const el = state.elements.get(id);
                        if (el) newElements.set(id, el);
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
