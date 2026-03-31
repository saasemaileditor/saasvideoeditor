import { create } from 'zustand';

export type CanvasElement = {
    id: string;
    type: 'text' | 'device' | 'card' | '3d';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    content?: string; // Holds the text string, or a URL for an image/video
};

interface EditorState {
    elements: CanvasElement[];
    selectedId: string | null;
    addElement: (element: CanvasElement) => void;
    updateElement: (id: string, data: Partial<CanvasElement>) => void;
    setSelectedId: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
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

    // Tracks what the user currently clicked on
    setSelectedId: (id) => set({ selectedId: id }),
}));
