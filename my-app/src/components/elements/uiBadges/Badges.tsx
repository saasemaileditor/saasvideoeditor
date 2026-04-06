import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

// ── Status Badge ──────────────────────────────────────────
export interface StatusBadgeProps extends BaseElementProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
  label?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'online',
  label,
  showDot = true,

  className = '',
  style,
}) => {
  const config = {
    online: { color: '#22c55e', bg: '#22c55e1a', text: 'Online' },
    offline: { color: '#6b7280', bg: '#6b72801a', text: 'Offline' },
    busy: { color: '#ef4444', bg: '#ef44441a', text: 'Busy' },
    away: { color: '#f59e0b', bg: '#f59e0b1a', text: 'Away' },
  };
  const c = config[status];
  return (
    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: c.bg, color: c.color, fontSize: 12, fontWeight: 600, ...style }}>
      {showDot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block' }} />}
      {label ?? c.text}
    </motion.span>
  );
};

// ── Notification Badge ──────────────────────────────────────────
export interface NotificationBadgeProps extends BaseElementProps {
  count?: number;
  color?: string;
  size?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 5,
  color = '#ef4444',
  size = 22,
  className = '',
  style,
}) => (
  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className={className}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: size, height: size, borderRadius: 20, background: color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '0 5px', ...style }}>
    {count > 99 ? '99+' : count}
  </motion.span>
);

// ── Tag Chip ──────────────────────────────────────────
export interface TagChipProps extends BaseElementProps {
  label?: string;
  accentColor?: string;
  removable?: boolean;
}

export const TagChip: React.FC<TagChipProps> = ({
  label = 'Design',
  accentColor = '#7c3aed',
  removable = true,

  className = '',
  style,
}) => (
  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className={className}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: accentColor + '1a', color: accentColor, fontSize: 12, fontWeight: 600, border: `1px solid ${accentColor}33`, ...style }}>
    {label}
    {removable && <span style={{ cursor: 'pointer', opacity: 0.7, fontSize: 14, lineHeight: 1 }}>×</span>}
  </motion.span>
);

// ── Pill Tag ──────────────────────────────────────────
export interface PillTagProps extends BaseElementProps {
  label?: string;
  accentColor?: string;
}

export const PillTag: React.FC<PillTagProps> = ({
  label = 'Featured',
  accentColor = '#7c3aed',
  className = '',
  style,
}) => (
  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={className}
    style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 9999, background: accentColor, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', ...style }}>
    {label}
  </motion.span>
);

// ── Counter Badge ──────────────────────────────────────────
export interface CounterBadgeProps extends BaseElementProps {
  count?: number;
  label?: string;
  accentColor?: string;
}

export const CounterBadge: React.FC<CounterBadgeProps> = ({
  count = 42,
  label = 'Messages',
  accentColor = '#7c3aed',
  isDark = false,
  className = '',
  style,
}) => {
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <span style={{ fontSize: 14, color: textColor }}>{label}</span>
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 20, background: accentColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '0 5px' }}>
        {count}
      </motion.span>
    </div>
  );
};
