export interface BaseElementProps {
  isDark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export type ElementType = string;

export interface ElementDefinition {
  type: ElementType;
  label: string;
  category: string;
  boundingSize: [number, number];
  defaultProps?: Record<string, any>;
}
