import React from 'react';
import type { BaseElementProps } from '../types';

export interface DividerProps extends BaseElementProps {
  color?: string;
  length?: number;
  thickness?: number;
  label?: string;
}

export const HorizontalLine: React.FC<DividerProps> = ({ color, length = '100%' as any, thickness = 1, isDark = false, className = '', style }) => (
  <hr className={className} style={{ border: 'none', borderTop: `${thickness}px solid ${color ?? (isDark ? '#2a2d45' : '#e5e7eb')}`, width: length, margin: '8px 0', ...style }} />
);

export const VerticalLine: React.FC<DividerProps> = ({ color, length = 80, thickness = 1, isDark = false, className = '', style }) => (
  <div className={className} style={{ width: thickness, height: length, background: color ?? (isDark ? '#2a2d45' : '#e5e7eb'), ...style }} />
);

export const DottedLine: React.FC<DividerProps> = ({ color, length = '100%' as any, isDark = false, className = '', style }) => (
  <hr className={className} style={{ border: 'none', borderTop: `2px dashed ${color ?? (isDark ? '#2a2d45' : '#d1d5db')}`, width: length, margin: '8px 0', ...style }} />
);

export const GradientLine: React.FC<DividerProps> = ({ length = '100%' as any, thickness = 2, className = '', style }) => (
  <div className={className} style={{ width: length, height: thickness, background: 'linear-gradient(to right, transparent, #7c3aed, #db2777, transparent)', borderRadius: 2, margin: '8px 0', ...style }} />
);

export const Spacer: React.FC<{ height?: number; className?: string; style?: React.CSSProperties }> = ({ height = 24, className = '', style }) => (
  <div className={className} style={{ height, width: '100%', ...style }} aria-hidden />
);
