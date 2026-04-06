import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface PrimaryButtonProps extends BaseElementProps {
  label?: string;
  accentColor?: string;
  textColor?: string;
  borderRadius?: number;
  fontSize?: number;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label = 'Get Started',
  accentColor = '#7c3aed',
  textColor = '#ffffff',
  borderRadius = 10,
  fontSize = 15,
  className = '',
  style,
}) => (
  <motion.button
    whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${accentColor}55` }}
    whileTap={{ scale: 0.97 }}
    className={className}
    style={{ background: accentColor, color: textColor, borderRadius, fontSize, fontWeight: 600, padding: '10px 24px', border: 'none', cursor: 'pointer', boxShadow: `0 2px 10px ${accentColor}44`, ...style }}
  >{label}</motion.button>
);

export interface SecondaryButtonProps extends BaseElementProps {
  label?: string;
  accentColor?: string;
  borderRadius?: number;
  fontSize?: number;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label = 'Learn More',

  borderRadius = 10,
  fontSize = 15,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#2a2d45' : '#f3f4f6';
  const color = isDark ? '#e2e8f0' : '#374151';
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={className}
      style={{ background: bg, color, borderRadius, fontSize, fontWeight: 600, padding: '10px 24px', border: 'none', cursor: 'pointer', ...style }}
    >{label}</motion.button>
  );
};

export interface OutlineButtonProps extends BaseElementProps {
  label?: string;
  accentColor?: string;
  borderRadius?: number;
  fontSize?: number;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
  label = 'View More',
  accentColor = '#7c3aed',
  borderRadius = 10,
  fontSize = 15,
  className = '',
  style,
}) => (
  <motion.button
    whileHover={{ scale: 1.03, background: accentColor + '11' }}
    whileTap={{ scale: 0.97 }}
    className={className}
    style={{ background: 'transparent', color: accentColor, borderRadius, fontSize, fontWeight: 600, padding: '10px 24px', border: `2px solid ${accentColor}`, cursor: 'pointer', ...style }}
  >{label}</motion.button>
);

export interface GhostButtonProps extends BaseElementProps {
  label?: string;
  color?: string;
  borderRadius?: number;
  fontSize?: number;
}

export const GhostButton: React.FC<GhostButtonProps> = ({
  label = 'Cancel',
  color,
  borderRadius = 10,
  fontSize = 15,
  isDark = false,
  className = '',
  style,
}) => {
  const defaultColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.button
      whileHover={{ scale: 1.03, background: isDark ? '#ffffff10' : '#00000008' }}
      whileTap={{ scale: 0.97 }}
      className={className}
      style={{ background: 'transparent', color: color ?? defaultColor, borderRadius, fontSize, fontWeight: 600, padding: '10px 24px', border: 'none', cursor: 'pointer', ...style }}
    >{label}</motion.button>
  );
};

export interface IconButtonProps extends BaseElementProps {
  icon?: string;
  accentColor?: string;
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon = '⚙',
  accentColor = '#7c3aed',
  size = 44,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#2a2d45' : '#f3f4f6';
  return (
    <motion.button
      whileHover={{ scale: 1.08, background: accentColor + '22' }}
      whileTap={{ scale: 0.93 }}
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', background: bg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, ...style }}
    >{icon}</motion.button>
  );
};

export interface FABProps extends BaseElementProps {
  icon?: string;
  accentColor?: string;
  size?: number;
}

export const FAB: React.FC<FABProps> = ({
  icon = '+',
  accentColor = '#7c3aed',
  size = 56,
  className = '',
  style,
}) => (
  <motion.button
    whileHover={{ scale: 1.1, boxShadow: `0 8px 24px ${accentColor}66` }}
    whileTap={{ scale: 0.92 }}
    className={className}
    style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${accentColor}, #db2777)`, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45, fontWeight: 300, boxShadow: `0 4px 16px ${accentColor}55`, ...style }}
  >{icon}</motion.button>
);

export interface PillButtonProps extends BaseElementProps {
  label?: string;
  accentColor?: string;
  fontSize?: number;
}

export const PillButton: React.FC<PillButtonProps> = ({
  label = 'Subscribe',
  accentColor = '#7c3aed',
  fontSize = 14,
  className = '',
  style,
}) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    className={className}
    style={{ background: accentColor, color: '#fff', borderRadius: 9999, fontSize, fontWeight: 600, padding: '9px 22px', border: 'none', cursor: 'pointer', ...style }}
  >{label}</motion.button>
);

export interface SocialButtonProps extends BaseElementProps {
  platform?: 'google' | 'github' | 'twitter' | 'facebook';
  label?: string;
  borderRadius?: number;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  platform = 'google',
  label,
  borderRadius = 10,

  className = '',
  style,
}) => {
  const config = {
    google: { bg: '#ffffff', color: '#374151', border: '#e5e7eb', icon: '🔍', text: 'Continue with Google' },
    github: { bg: '#24292e', color: '#ffffff', border: '#24292e', icon: '🐙', text: 'Continue with GitHub' },
    twitter: { bg: '#1da1f2', color: '#ffffff', border: '#1da1f2', icon: '🐦', text: 'Continue with X' },
    facebook: { bg: '#1877f2', color: '#ffffff', border: '#1877f2', icon: '📘', text: 'Continue with Facebook' },
  };
  const c = config[platform];
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius, fontSize: 14, fontWeight: 600, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, ...style }}
    >
      <span>{c.icon}</span>{label ?? c.text}
    </motion.button>
  );
};
