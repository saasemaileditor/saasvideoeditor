// ─── Category metadata for panel display ────────────────────────────────────

export interface PanelElementDef {
  type: string;
  label: string;
  category: string;
  categoryLabel: string;
  boundingSize: [number, number];
  previewEmoji?: string;
  defaultProps?: Record<string, any>;
}

export const PANEL_ELEMENTS: PanelElementDef[] = [];
export const getElementComponent = (_type: string) => null;
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
