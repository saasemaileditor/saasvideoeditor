import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

const AVATAR_IMG_COLORS = ['#7c3aed', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#db2777'];

// ── Circle Avatar ──────────────────────────────────────────
export interface CircleAvatarProps extends BaseElementProps {
  initials?: string;
  size?: number;
  color?: string;
  imageEmoji?: string;
}

export const CircleAvatar: React.FC<CircleAvatarProps> = ({
  initials = 'AB',
  size = 56,
  color = '#7c3aed',
  imageEmoji = '',
  className = '',
  style,
}) => (
  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className}
    style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.33, fontWeight: 700, flexShrink: 0, boxShadow: `0 2px 10px ${color}44`, ...style }}>
    {imageEmoji || initials}
  </motion.div>
);

// ── Square Avatar ──────────────────────────────────────────
export interface SquareAvatarProps extends BaseElementProps {
  initials?: string;
  size?: number;
  color?: string;
  borderRadius?: number;
}

export const SquareAvatar: React.FC<SquareAvatarProps> = ({
  initials = 'AB',
  size = 56,
  color = '#7c3aed',
  borderRadius = 10,
  className = '',
  style,
}) => (
  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className}
    style={{ width: size, height: size, borderRadius, background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.33, fontWeight: 700, flexShrink: 0, ...style }}>
    {initials}
  </motion.div>
);

// ── Avatar Group ──────────────────────────────────────────
export interface AvatarGroupProps extends BaseElementProps {
  count?: number;
  size?: number;
  overlap?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  count = 4,
  size = 40,
  overlap = 12,
  isDark = false,
  className = '',
  style,
}) => {
  const initials = ['AB', 'CD', 'EF', 'GH', 'IJ'];
  const border = isDark ? '#1e2235' : '#ffffff';
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', ...style }}>
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${AVATAR_IMG_COLORS[i % AVATAR_IMG_COLORS.length]}, ${AVATAR_IMG_COLORS[i % AVATAR_IMG_COLORS.length]}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.3, fontWeight: 700, border: `3px solid ${border}`, marginLeft: i === 0 ? 0 : -overlap, zIndex: count - i }}>
          {initials[i]}
        </div>
      ))}
      {count > 5 && (
        <div style={{ width: size, height: size, borderRadius: '50%', background: isDark ? '#2a2d45' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#94a3b8' : '#6b7280', fontSize: size * 0.27, fontWeight: 700, border: `3px solid ${border}`, marginLeft: -overlap }}>
          +{count - 5}
        </div>
      )}
    </div>
  );
};

// ── Initials Avatar ──────────────────────────────────────────
export interface InitialsAvatarProps extends BaseElementProps {
  name?: string;
  size?: number;
  shape?: 'circle' | 'square';
  accentColor?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name = 'Jordan Lee',
  size = 56,
  shape = 'circle',
  accentColor = '#7c3aed',
  isDark = false,
  className = '',
  style,
}) => {
  const initials = name.split(' ').map(p => p[0]?.toUpperCase()).slice(0, 2).join('');
  const bg = isDark ? '#2a2d45' : accentColor + '1a';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className}
      style={{ width: size, height: size, borderRadius: shape === 'circle' ? '50%' : 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, fontSize: size * 0.33, fontWeight: 800, ...style }}>
      {initials}
    </motion.div>
  );
};
