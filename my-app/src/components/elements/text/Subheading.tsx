import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface SubheadingProps extends BaseElementProps {
  text?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export const Subheading: React.FC<SubheadingProps> = ({
  text = 'Subheading Title',
  color,
  fontSize = 28,
  fontWeight = 600,
  textAlign = 'left',
  isDark = false,
  className = '',
  style,
}) => {
  const defaultColor = isDark ? '#e2e8f0' : '#1f2937';
  return (
    <motion.h2
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ fontSize, fontWeight, textAlign, lineHeight: 1.25, color: color ?? defaultColor, margin: 0, ...style }}
    >
      {text}
    </motion.h2>
  );
};
