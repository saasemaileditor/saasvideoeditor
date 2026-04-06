import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface BasicCardProps extends BaseElementProps {
  title?: string;
  subtitle?: string;
  borderColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export const BasicCard: React.FC<BasicCardProps> = ({
  title = 'Card Title',
  subtitle = 'Simple container with clean border and subtle shadow.',
  borderColor,
  backgroundColor,
  borderRadius = 12,
  padding = 20,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = backgroundColor ?? (isDark ? '#1e2235' : '#ffffff');
  const border = borderColor ?? (isDark ? '#2a2d45' : '#e5e7eb');
  const titleColor = isDark ? '#f1f5f9' : '#111827';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ background: bg, border: `1px solid ${border}`, borderRadius, padding, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 1px 6px rgba(0,0,0,0.06)', ...style }}
    >
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: titleColor }}>{title}</h3>
      <p style={{ margin: '8px 0 0', fontSize: 14, color: textColor, lineHeight: 1.5 }}>{subtitle}</p>
    </motion.div>
  );
};
