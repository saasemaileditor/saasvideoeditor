// Removed unused lazy import
import type { ElementType } from './types';

// ─── Lazy-loaded element registry ───────────────────────────────────────────
// Each element category chunk is split automatically by the bundler.
// Components are loaded on-demand — only when needed on the canvas.

export const elementRegistry: Partial<Record<ElementType, React.LazyExoticComponent<any>>> = {};

/** Get a lazy-loaded element component by its type string. Returns null if unknown. */
export const getElementComponent = (type: string) => {
  return elementRegistry[type as ElementType] ?? null;
};

// ─── Element Definitions for Panel UI ───────────────────────────────────────
// Used to populate the sidebar Elements panel with draggable cards.

export interface PanelElementDef {
  type: ElementType;
  label: string;
  category: string;
  categoryLabel: string;
  boundingSize: [number, number];
  previewEmoji?: string;
  defaultProps?: Record<string, any>;
}

export const PANEL_ELEMENTS: PanelElementDef[] = [];

// ─── Category metadata for panel display ────────────────────────────────────
export const ELEMENT_CATEGORIES = [
  { id: 'text', label: 'Text', emoji: '🔤' },
  { id: 'cards', label: 'Cards', emoji: '🃏' },
  { id: 'buttons', label: 'Buttons', emoji: '🟣' },
  { id: 'inputs', label: 'Inputs', emoji: '✏' },
  { id: 'uiBadges', label: 'UI Badges', emoji: '🏷' },
  { id: 'avatars', label: 'Avatars', emoji: '👤' },
  { id: 'alerts', label: 'Alerts', emoji: '⚠️' },
  { id: 'tooltips', label: 'Tooltips', emoji: '💭' },
  { id: 'shapes', label: 'Shapes', emoji: '◼' },
  { id: 'layouts', label: 'Layouts', emoji: '⬛⬛' },
  { id: 'dividers', label: 'Dividers', emoji: '─' },
  { id: 'mediaFrames', label: 'Media Frames', emoji: '🖼' },
  { id: 'icons', label: 'Icons', emoji: '🎨' },
  { id: 'socialProof', label: 'Social Proof', emoji: '⭐' },
  { id: 'progress', label: 'Progress', emoji: '📶' },
  { id: 'charts', label: 'Charts', emoji: '📊' },
];

export type { ElementType } from './types';
