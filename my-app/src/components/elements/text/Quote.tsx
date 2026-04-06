import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface QuoteProps extends BaseElementProps {
  text?: string;
  author?: string;
  accentColor?: string;
  fontSize?: number;
}

export const Quote: React.FC<QuoteProps> = ({
  text = '"Design is not just what it looks like and feels like. Design is how it works."',
  author = '— Steve Jobs',
  accentColor = '#7c3aed',
  fontSize = 18,
  isDark = false,
  className = '',
  style,
}) => {
  const textColor = isDark ? '#e2e8f0' : '#1f2937';
  const authorColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.blockquote
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
      style={{
        borderLeft: `4px solid ${accentColor}`,
        paddingLeft: 16,
        margin: 0,
        ...style,
      }}
    >
      <p style={{ fontSize, fontStyle: 'italic', color: textColor, margin: 0, lineHeight: 1.6 }}>{text}</p>
      {author && <footer style={{ fontSize: fontSize * 0.75, color: authorColor, marginTop: 8, fontWeight: 500 }}>{author}</footer>}
    </motion.blockquote>
  );
};
