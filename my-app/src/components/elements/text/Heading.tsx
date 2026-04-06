import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface HeadingProps extends BaseElementProps {
  text?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  gradient?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  text = 'Headline Title',
  color,
  fontSize = 48,
  fontWeight = 800,
  textAlign = 'left',
  gradient = false,
  isDark = false,
  className = '',
  style,
}) => {
  const defaultColor = isDark ? '#ffffff' : '#111827';

  return (
    <motion.h1
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
      style={{
        fontSize,
        fontWeight,
        textAlign,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        color: gradient ? 'transparent' : (color ?? defaultColor),
        background: gradient
          ? 'linear-gradient(135deg, #7c3aed, #db2777)'
          : undefined,
        WebkitBackgroundClip: gradient ? 'text' : undefined,
        backgroundClip: gradient ? 'text' : undefined,
        margin: 0,
        ...style,
      }}
    >
      {text}
    </motion.h1>
  );
};
