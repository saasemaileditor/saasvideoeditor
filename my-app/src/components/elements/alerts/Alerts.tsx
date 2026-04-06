import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const ALERT_CONFIG: Record<AlertVariant, { bg: string; border: string; icon: string; color: string }> = {
  info: { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', color: '#1d4ed8' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', color: '#15803d' },
  warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', color: '#d97706' },
  error: { bg: '#fef2f2', border: '#fecaca', icon: '❌', color: '#dc2626' },
};

const ALERT_CONFIG_DARK: Record<AlertVariant, { bg: string; border: string; color: string }> = {
  info: { bg: '#1e3a5f', border: '#1d4ed8', color: '#93c5fd' },
  success: { bg: '#14532d', border: '#15803d', color: '#86efac' },
  warning: { bg: '#78350f', border: '#d97706', color: '#fcd34d' },
  error: { bg: '#7f1d1d', border: '#dc2626', color: '#fca5a5' },
};

// ── Generic Alert ──────────────────────────────────────────
export interface AlertProps extends BaseElementProps {
  variant?: AlertVariant;
  title?: string;
  message?: string;
  dismissible?: boolean;
}

const AlertBase: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message = 'This is an alert message with important information.',
  dismissible = true,
  isDark = false,
  className = '',
  style,
}) => {
  const c = isDark ? { ...ALERT_CONFIG[variant], ...ALERT_CONFIG_DARK[variant] } : ALERT_CONFIG[variant];
  const bg = isDark ? ALERT_CONFIG_DARK[variant].bg : c.bg;
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={className}
      style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: bg, border: `1px solid ${c.border}`, alignItems: 'flex-start', ...style }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{ALERT_CONFIG[variant].icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isDark ? ALERT_CONFIG_DARK[variant].color : c.color }}>{title}</p>}
        <p style={{ margin: title ? '2px 0 0' : 0, fontSize: 13, color: isDark ? ALERT_CONFIG_DARK[variant].color : c.color, lineHeight: 1.5, opacity: title ? 0.85 : 1 }}>{message}</p>
      </div>
      {dismissible && <span style={{ cursor: 'pointer', color: isDark ? ALERT_CONFIG_DARK[variant].color : c.color, opacity: 0.6, fontSize: 16, flexShrink: 0, lineHeight: '20px' }}>×</span>}
    </motion.div>
  );
};

export const InfoAlert: React.FC<AlertProps> = (props) => <AlertBase {...props} variant="info" />;
export const SuccessAlert: React.FC<AlertProps> = (props) => <AlertBase {...props} variant="success" />;
export const WarningAlert: React.FC<AlertProps> = (props) => <AlertBase {...props} variant="warning" />;
export const ErrorAlert: React.FC<AlertProps> = (props) => <AlertBase {...props} variant="error" />;

// ── Banner ──────────────────────────────────────────
export interface BannerProps extends BaseElementProps {
  message?: string;
  accentColor?: string;
  ctaLabel?: string;
}

export const Banner: React.FC<BannerProps> = ({
  message = '🚀 New feature just launched! Check it out now.',
  accentColor = '#7c3aed',
  ctaLabel = 'Learn More →',

  className = '',
  style,
}) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={className}
    style={{ width: '100%', padding: '10px 16px', background: `linear-gradient(135deg, ${accentColor}, #db2777)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 10, ...style }}>
    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{message}</span>
    <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'underline', cursor: 'pointer', opacity: 0.9 }}>{ctaLabel}</span>
  </motion.div>
);
