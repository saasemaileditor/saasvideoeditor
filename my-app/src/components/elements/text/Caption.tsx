import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface CaptionProps extends BaseElementProps {
  text?: string;
  color?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export const Caption: React.FC<CaptionProps> = ({
  text = 'Caption — small descriptive text',
  color,
  fontSize = 12,
  textAlign = 'left',
  isDark = false,
  className = '',
  style,
}) => {
  const defaultColor = isDark ? '#64748b' : '#9ca3af';
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{ fontSize, textAlign, color: color ?? defaultColor, display: 'block', letterSpacing: '0.01em', ...style }}
    >
      {text}
    </motion.span>
  );
};
