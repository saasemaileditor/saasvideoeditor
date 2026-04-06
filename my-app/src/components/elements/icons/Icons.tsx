import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface IconSetProps extends BaseElementProps {
  size?: number;
  color?: string;
}

// ── Arrow Icons ──────────────────────────────────────────
export const ArrowIcons: React.FC<IconSetProps> = ({ size = 32, color, isDark = false, className = '', style }) => {
  const c = color ?? (isDark ? '#94a3b8' : '#6b7280');
  const arrows = ['↑', '→', '↓', '←', '↗', '↘', '↙', '↖'];
  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, ...style }}>
      {arrows.map((a, i) => (
        <motion.span key={i} whileHover={{ scale: 1.3, color: '#7c3aed' }} style={{ fontSize: size, color: c, cursor: 'default', lineHeight: 1 }}>{a}</motion.span>
      ))}
    </div>
  );
};

// ── Social Icons ──────────────────────────────────────────
const SOCIAL = [
  { name: 'Facebook', emoji: 'f', color: '#1877f2' },
  { name: 'Instagram', emoji: '📸', color: '#e1306c' },
  { name: 'X', emoji: '✕', color: (isDark: boolean) => isDark ? '#ffffff' : '#000000' },
  { name: 'LinkedIn', emoji: 'in', color: '#0077b5' },
  { name: 'YouTube', emoji: '▶', color: '#ff0000' },
  { name: 'TikTok', emoji: '♪', color: '#69c9d0' },
];

export const SocialIcons: React.FC<IconSetProps & { platforms?: string[] }> = ({ size = 36, isDark = false, className = '', style }) => (
  <div className={className} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', ...style }}>
    {SOCIAL.map((s) => {
      const bg = typeof s.color === 'function' ? (isDark ? '#ffffff' : '#000000') : s.color;
      return (
        <motion.div key={s.name} whileHover={{ scale: 1.15 }} style={{ width: size, height: size, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.35, fontWeight: 800, cursor: 'pointer' }}>
          {typeof s.emoji === 'string' ? s.emoji : s.name[0]}
        </motion.div>
      );
    })}
  </div>
);

// ── UI Icons ──────────────────────────────────────────
const UI_ICONS = ['☰', '✕', '✓', '+', '−', '⚙', '👤', '🏠', '🔍', '🔔', '❤', '★', '⬇', '⬆', '↗', '🔗', '📅', '⏱', '✉', '📞', '📍'];

export const UIIcons: React.FC<IconSetProps> = ({ size = 22, color, isDark = false, className = '', style }) => {
  const c = color ?? (isDark ? '#94a3b8' : '#374151');
  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, ...style }}>
      {UI_ICONS.map((icon, i) => (
        <motion.span key={i} whileHover={{ scale: 1.3, color: '#7c3aed' }} style={{ fontSize: size, color: c, cursor: 'default', lineHeight: 1 }}>{icon}</motion.span>
      ))}
    </div>
  );
};

// ── Contact Icons ──────────────────────────────────────────
const CONTACT_ICONS = [
  { icon: '✉', label: 'Email' },
  { icon: '📞', label: 'Phone' },
  { icon: '🏢', label: 'Address' },
  { icon: '📍', label: 'Location' },
];

export const ContactIcons: React.FC<IconSetProps> = ({ size = 16, isDark = false, className = '', style }) => {
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {CONTACT_ICONS.map((c) => (
        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: size + 4 }}>{c.icon}</span>
          <span style={{ fontSize: size, color: textColor, fontWeight: 500 }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
};
