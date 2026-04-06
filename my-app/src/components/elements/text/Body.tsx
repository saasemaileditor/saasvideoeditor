import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface BodyProps extends BaseElementProps {
  text?: string;
  color?: string;
  fontSize?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export const Body: React.FC<BodyProps> = ({
  text = 'This is body paragraph text. It supports longer descriptions and multiple lines of readable content for your layout.',
  color,
  fontSize = 16,
  lineHeight = 1.6,
  textAlign = 'left',
  isDark = false,
  className = '',
  style,
}) => {
  const defaultColor = isDark ? '#94a3b8' : '#4b5563';
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{ fontSize, lineHeight, textAlign, color: color ?? defaultColor, margin: 0, ...style }}
    >
      {text}
    </motion.p>
  );
};
