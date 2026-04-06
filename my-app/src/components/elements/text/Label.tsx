import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface LabelProps extends BaseElementProps {
  text?: string;
  color?: string;
  fontSize?: number;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  text = 'Form Label',
  color,
  fontSize = 14,
  required = false,
  isDark = false,
  className = '',
  style,
}) => {
  const defaultColor = isDark ? '#cbd5e1' : '#374151';
  return (
    <motion.label
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{ fontSize, fontWeight: 500, color: color ?? defaultColor, display: 'block', ...style }}
    >
      {text}
      {required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
    </motion.label>
  );
};
