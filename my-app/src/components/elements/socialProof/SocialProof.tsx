import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

// ── Star Rating ──────────────────────────────────────────
export interface StarRatingProps extends BaseElementProps {
  rating?: number;
  maxStars?: number;
  size?: number;
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating = 4.5, maxStars = 5, size = 20, showLabel = true, isDark = false, className = '', style }) => {
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...style }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: maxStars }).map((_, i) => (
          <span key={i} style={{ fontSize: size, color: i < Math.floor(rating) ? '#f59e0b' : (i < rating ? '#f59e0b' : '#d1d5db'), opacity: i + 0.5 < rating ? 1 : i < rating ? 0.5 : 0.3 }}>★</span>
        ))}
      </div>
      {showLabel && <span style={{ fontSize: size * 0.7, fontWeight: 600, color: textColor, marginLeft: 4 }}>{rating} / {maxStars}</span>}
    </div>
  );
};

// ── Review Quote ──────────────────────────────────────────
export interface ReviewQuoteProps extends BaseElementProps {
  quote?: string;
  author?: string;
  role?: string;
  rating?: number;
}

export const ReviewQuote: React.FC<ReviewQuoteProps> = ({ quote = '"Absolutely fantastic product! Changed how we work completely."', author = 'Alex Chen', role = 'CTO at Startup Inc', rating = 5, isDark = false, className = '', style }) => {
  const bg = isDark ? '#1e2235' : '#fffbeb';
  const border = isDark ? '#2a2d45' : '#fde68a';
  const quoteColor = isDark ? '#e2e8f0' : '#1f2937';
  const roleColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={className}
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 18, ...style }}>
      <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ fontSize: 14, color: i < rating ? '#f59e0b' : '#e5e7eb' }}>★</span>)}
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, fontStyle: 'italic', color: quoteColor, lineHeight: 1.6 }}>{quote}</p>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: quoteColor }}>{author}</div>
        <div style={{ fontSize: 11, color: roleColor }}>{role}</div>
      </div>
    </motion.div>
  );
};

// ── Logo Grid ──────────────────────────────────────────
export interface LogoGridProps extends BaseElementProps {
  logos?: { name: string; emoji: string; color: string }[];
}

export const LogoGrid: React.FC<LogoGridProps> = ({
  logos = [
    { name: 'Google', emoji: 'G', color: '#4285f4' },
    { name: 'Meta', emoji: 'M', color: '#1877f2' },
    { name: 'Apple', emoji: '', color: '#000000' },
    { name: 'Amazon', emoji: 'A', color: '#ff9900' },
    { name: 'Netflix', emoji: 'N', color: '#e50914' },
    { name: 'Spotify', emoji: '♫', color: '#1db954' },
  ],
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#f9fafb';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, ...style }}>
      {logos.map((logo) => (
        <div key={logo.name} style={{ height: 40, padding: '0 16px', background: bg, border: `1px solid ${border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: logo.color }}>{logo.emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#374151' }}>{logo.name}</span>
        </div>
      ))}
    </div>
  );
};

// ── Trust Badge ──────────────────────────────────────────
export interface TrustBadgeProps extends BaseElementProps {
  label?: string;
  sublabel?: string;
  icon?: string;
  accentColor?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ label = 'SSL Secured', sublabel = '256-bit encryption', icon = '🔒', isDark = false, className = '', style }) => {
  const bg = isDark ? '#14532d' : '#f0fdf4';
  const border = isDark ? '#15803d' : '#bbf7d0';
  const textColor = isDark ? '#86efac' : '#15803d';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 10, ...style }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{label}</div>
        <div style={{ fontSize: 11, color: textColor, opacity: 0.7 }}>{sublabel}</div>
      </div>
    </motion.div>
  );
};

// ── As Seen On ──────────────────────────────────────────
export interface AsSeenOnProps extends BaseElementProps {
  publications?: { name: string; emoji: string }[];
}

export const AsSeenOn: React.FC<AsSeenOnProps> = ({
  publications = [
    { name: 'TechCrunch', emoji: '🟢' },
    { name: 'Forbes', emoji: '🔵' },
    { name: 'Wired', emoji: '⚫' },
    { name: 'Mashable', emoji: '🔴' },
  ],
  isDark = false,
  className = '',
  style,
}) => {
  const labelColor = isDark ? '#64748b' : '#9ca3af';
  const textColor = isDark ? '#94a3b8' : '#374151';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', ...style }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: labelColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>As Seen On</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 16px', background: isDark ? '#1e2235' : '#f9fafb', borderRadius: 10, border: `1px solid ${border}` }}>
        {publications.map((pub) => (
          <div key={pub.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12 }}>{pub.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{pub.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
