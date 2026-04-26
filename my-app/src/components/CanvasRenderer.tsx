import React, { useRef } from 'react';
import { useEditorStore, useUIStore } from '../store/useEditorStore';
import { CanvaBoundingBox } from './CanvaBoundingBox';
import type { CanvasElement } from '../store/useEditorStore';

// ─── Element component registry ──────────────────────────────────────────────
// As you build more elements, import and add them here.
// Key = element type string, Value = React component
const ELEMENT_REGISTRY: Record<string, React.FC<any>> = {
};

// ─── Parent offset calculator ─────────────────────────────────────────────────
// Walks up the parentId chain and sums all ancestor x/y offsets.
// This is what makes parenting work without HTML nesting.
function getWorldPosition(
    element: CanvasElement,
    allElements: Record<string, CanvasElement>
): { x: number; y: number } {
    let x = element.x;
    let y = element.y;
    let current = element;

    // Walk up parent chain — max 10 levels to prevent infinite loops
    let safety = 0;
    while (current.parentId && safety < 10) {
        const parent = allElements[current.parentId];
        if (!parent) break;
        x += parent.x;
        y += parent.y;
        current = parent;
        safety++;
    }

    return { x, y };
}

// ─── Single element renderer ──────────────────────────────────────────────────
function CanvasElementRenderer({
    element,
    allElements,
    containerRef,
}: {
    element: CanvasElement;
    allElements: Record<string, CanvasElement>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const targetRef = useRef<HTMLDivElement>(null);
    const { selectedId, setSelectedId } = useUIStore();
    const { updateElement } = useEditorStore();
    const isSelected = selectedId === element.id;

    // Calculate final world position including parent offset
    const { x, y } = getWorldPosition(element, allElements);

    // Build CSS transform from raw numbers
    const transform = `translate(${x}px, ${y}px) rotate(${element.rotation}deg) scale(${element.scaleX}, ${element.scaleY})`;

    // Look up the correct component from registry
    const ElementComponent = ELEMENT_REGISTRY[element.type];

    if (!ElementComponent) {
        console.warn(`No component registered for element type: ${element.type}`);
        return null;
    }

    return (
        <>
            <div
                ref={targetRef}
                onClick={() => setSelectedId(element.id)}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: element.width,
                    height: element.height,
                    transform,
                    transformOrigin: 'center center',
                    opacity: element.opacity,
                    zIndex: element.zIndex ?? 0,
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
            >
                {/* Render the actual element component with its schema props */}
                <ElementComponent
                    {...element.props}
                    width={element.width}
                    height={element.height}
                    content={element.content}
                />
            </div>

            {/* Show bounding box only when selected */}
            {isSelected && (
                <CanvaBoundingBox
                    el={element}
                    updateElement={updateElement}
                    containerRef={containerRef}
                    targetRef={targetRef}
                />
            )}
        </>
    );
}

// ─── Main Canvas Renderer ─────────────────────────────────────────────────────
export function CanvasRenderer() {
    console.log('RENDER: Canvas updated');
    const { elements, elementIds } = useEditorStore();
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: '#1a1a1a',
            }}
        >
            {elementIds.map(id => {
                const element = elements[id];
                if (!element) return null;
                return (
                    <CanvasElementRenderer
                        key={id}
                        element={element}
                        allElements={elements}
                        containerRef={containerRef}
                    />
                );
            })}
        </div>
    );
}
