import { create } from 'zustand';
import { temporal } from 'zundo';
import { useStore } from 'zustand';

export type CanvasElement = {
    id: string;
    type: 'text' | 'device' | 'card' | '3d' | 'chart' | 'counter' | 'button' | 'icon' | 'shape';
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
};

interface EditorState {
    elements: CanvasElement[];
    selectedId: string | null;
    addElement: (element: CanvasElement) => void;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    removeElement: (id: string) => void;
    setSelectedId: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>()(
    temporal(
        (set) => ({
            elements: [],
            selectedId: null,

            // Adds a new item to the canvas
            addElement: (element) => set((state) => ({
                elements: [...state.elements, element],
                selectedId: element.id // Automatically select the new item
            })),

            // Updates an item's position/rotation/scale smoothly
            updateElement: (id, data) => set((state) => ({
                elements: state.elements.map((el) =>
                    el.id === id ? { ...el, ...data } : el
                )
            })),

            // Removes an element from the canvas
            removeElement: (id) => set((state) => ({
                elements: state.elements.filter((el) => el.id !== id),
                selectedId: state.selectedId === id ? null : state.selectedId,
            })),

            // Tracks what the user currently clicked on
            setSelectedId: (id) => set({ selectedId: id }),
        }),
        {
            partialize: (state) => ({ elements: state.elements }),
        }
    )
);

// TODO: fix zundo typing — using `as any` to work around temporal type inference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTemporalStore(selector: (state: any) => any) {
    return useStore((useEditorStore as any).temporal, selector);
}
