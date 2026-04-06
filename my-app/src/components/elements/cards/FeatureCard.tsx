import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface FeatureCardProps extends BaseElementProps {
  icon?: string;
  title?: string;
  description?: string;
  accentColor?: string;
  backgroundColor?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon = '⚡',
  title = 'Feature Title',
  description = 'A short description of this amazing feature and what it does for your users.',
  accentColor = '#7c3aed',
  backgroundColor,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = backgroundColor ?? (isDark ? '#1e2235' : '#ffffff');
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const titleColor = isDark ? '#f1f5f9' : '#111827';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 24, boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)', ...style }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 10, background: accentColor + '1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: titleColor }}>{title}</h3>
      <p style={{ margin: '8px 0 0', fontSize: 14, color: textColor, lineHeight: 1.55 }}>{description}</p>
    </motion.div>
  );
};
