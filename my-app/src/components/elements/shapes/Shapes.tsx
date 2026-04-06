import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface ShapeBaseProps extends BaseElementProps {
  color?: string;
  width?: number;
  height?: number;
  strokeOnly?: boolean;
  strokeColor?: string;
}

export const Rectangle: React.FC<ShapeBaseProps> = ({ color, width = 120, height = 70, strokeOnly = false, strokeColor, className = '', style }) => {
  return <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className} style={{ width, height, background: strokeOnly ? 'transparent' : (color ?? '#7c3aed'), border: strokeOnly ? `2px solid ${strokeColor ?? (color ?? '#7c3aed')}` : 'none', borderRadius: 0, ...style }} />;
};

export const RoundedRectangle: React.FC<ShapeBaseProps> = ({ color, width = 120, height = 70, strokeOnly = false, strokeColor, borderRadius = 14, className = '', style }: ShapeBaseProps & { borderRadius?: number }) => (
  <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className} style={{ width, height, background: strokeOnly ? 'transparent' : (color ?? '#7c3aed'), border: strokeOnly ? `2px solid ${strokeColor ?? (color ?? '#7c3aed')}` : 'none', borderRadius: borderRadius ?? 14, ...style }} />
);

export const Circle: React.FC<ShapeBaseProps> = ({ color, width = 80, strokeOnly = false, strokeColor, className = '', style }) => (
  <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className} style={{ width, height: width, borderRadius: '50%', background: strokeOnly ? 'transparent' : (color ?? '#7c3aed'), border: strokeOnly ? `2px solid ${strokeColor ?? (color ?? '#7c3aed')}` : 'none', ...style }} />
);

export const Oval: React.FC<ShapeBaseProps> = ({ color, width = 120, height = 60, strokeOnly = false, strokeColor, className = '', style }) => (
  <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className} style={{ width, height, borderRadius: '50%', background: strokeOnly ? 'transparent' : (color ?? '#7c3aed'), border: strokeOnly ? `2px solid ${strokeColor ?? (color ?? '#7c3aed')}` : 'none', ...style }} />
);

export const Triangle: React.FC<ShapeBaseProps> = ({ color, width = 80, height = 70, className = '', style }) => (
  <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className} style={{ width: 0, height: 0, borderLeft: `${width/2}px solid transparent`, borderRight: `${width/2}px solid transparent`, borderBottom: `${height}px solid ${color ?? '#7c3aed'}`, background: 'transparent', ...style }} />
);

export const Star: React.FC<ShapeBaseProps> = ({ color, width = 60, className = '', style }) => (
  <motion.div initial={{ opacity: 0, rotate: -20, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ duration: 0.35 }} className={className} style={{ fontSize: width, lineHeight: 1, color: color ?? '#f59e0b', userSelect: 'none', ...style }}>⭐</motion.div>
);

export const Arrow: React.FC<ShapeBaseProps & { direction?: 'right' | 'left' | 'up' | 'down' }> = ({ color, width = 40, direction = 'right', className = '', style }) => {
  const rotations: Record<string, string> = { right: '0deg', left: '180deg', up: '-90deg', down: '90deg' };
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className={className} style={{ fontSize: width * 0.7, color: color ?? '#7c3aed', transform: `rotate(${rotations[direction as string] ?? '0deg'})`, display: 'inline-flex', ...style }}>→</motion.div>
  );
};

export const Line: React.FC<ShapeBaseProps & { orientation?: 'horizontal' | 'vertical' }> = ({ color, width = 120, height = 2, orientation = 'horizontal', className = '', style }) => (
  <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.3 }} className={className} style={{ width: orientation === 'horizontal' ? width : (height ?? 2), height: orientation === 'horizontal' ? (height ?? 2) : width, background: color ?? '#7c3aed', borderRadius: 2, ...style }} />
);

export const Wave: React.FC<ShapeBaseProps> = ({ color, width = 140, height = 40, className = '', style }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className={className} style={{ ...style }}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={`M0 ${height/2} Q${width/4} 0 ${width/2} ${height/2} Q${width*3/4} ${height} ${width} ${height/2}`} stroke={color ?? '#7c3aed'} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  </motion.div>
);
