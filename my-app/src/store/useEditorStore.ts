import { create } from 'zustand';
import { travel } from 'zustand-travel';
import type { ManualTravelsControls } from 'zustand-travel';

// ─── Element type ────────────────────────────────────────────────────────────

export type CanvasElement = {
    id: string;
    type: 'text' | 'device' | 'card' | '3d' | 'chart' | 'counter' | 'button' | 'icon' | 'shape' | 'list' | 'searchBar' | 'notification';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
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
}

export const useUIStore = create<UIState>((set) => ({
    selectedId: null,
    setSelectedId: (id) => set({ selectedId: id }),
}));

// ─── Document State Store (Undoable) ──────────────────────────────────────────

interface EditorState {
    // UNDOABLE — stored as Map for O(1) lookups + insertion-ordered id list
    elements: Map<string, CanvasElement>;
    elementIds: string[];

    // Actions
    addElement: (element: CanvasElement) => void;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    removeElement: (id: string) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>()(
    travel(
        (set) => ({
            // Undoable state
            elements: new Map<string, CanvasElement>(),
            elementIds: [] as string[],

            // Adds a new item to the canvas and selects it
            addElement: (element) => {
                console.log('addElement START - element:', element.id);
                set((state) => {
                    console.log('addElement set callback - state.elements size:', state.elements.size);
                    const newState = {
                        elements: new Map([...state.elements, [element.id, element]]),
                        elementIds: [...state.elementIds, element.id],
                    };
                    console.log('addElement returning new state');
                    return newState;
                });
                console.log('addElement END');
            },

            // Updates an item's fields (position/rotation/scale/etc.)
            updateElement: (id, data) =>
                set((state) => {
                    const el = state.elements.get(id);
                    if (!el) return state;
                    return {
                        elements: new Map([...state.elements, [id, { ...el, ...data }]]),
                        elementIds: state.elementIds,
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
                    };
                }),
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
