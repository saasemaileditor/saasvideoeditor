import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface TestimonialCardProps extends BaseElementProps {
  quote?: string;
  name?: string;
  role?: string;
  avatarInitials?: string;
  avatarColor?: string;
  rating?: number;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote = '"This product completely transformed the way we work. Absolutely loved every feature — highly recommend!"',
  name = 'Sarah Johnson',
  role = 'Product Designer at Acme',
  avatarInitials = 'SJ',
  avatarColor = '#7c3aed',
  rating = 5,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const quoteColor = isDark ? '#e2e8f0' : '#1f2937';
  const subColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 22, boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)', ...style }}
    >
      <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ fontSize: 16, color: i < rating ? '#f59e0b' : (isDark ? '#374151' : '#d1d5db') }}>★</span>
        ))}
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14, fontStyle: 'italic', color: quoteColor, lineHeight: 1.6 }}>{quote}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>{avatarInitials}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: quoteColor }}>{name}</div>
          <div style={{ fontSize: 11, color: subColor }}>{role}</div>
        </div>
      </div>
    </motion.div>
  );
};
