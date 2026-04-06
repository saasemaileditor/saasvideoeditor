import React from 'react';
import type { BaseElementProps } from '../types';

// ── Shared helper ──────────────────────────────────────────
const BOX = (isDark: boolean, accent?: string): React.CSSProperties => ({
  background: isDark ? '#1e2235' : '#f9fafb',
  border: `1.5px dashed ${accent ?? (isDark ? '#2a2d45' : '#d1d5db')}`,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  color: isDark ? '#475569' : '#9ca3af',
  fontWeight: 500,
});

// ── 2-column grid ──────────────────────────────────────────
export interface TwoColumnGridProps extends BaseElementProps { gap?: number; item?: string; }
export const TwoColumnGrid: React.FC<TwoColumnGridProps> = ({ gap = 8, item = 'Column', isDark = false, className = '', style }) => (
  <div className={className} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap, width: '100%', ...style }}>
    {[1, 2].map(i => <div key={i} style={{ ...BOX(isDark), padding: 16 }}>{item} {i}</div>)}
  </div>
);

export interface ThreeColumnGridProps extends BaseElementProps { gap?: number; }
export const ThreeColumnGrid: React.FC<ThreeColumnGridProps> = ({ gap = 8, isDark = false, className = '', style }) => (
  <div className={className} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap, width: '100%', ...style }}>
    {[1, 2, 3].map(i => <div key={i} style={{ ...BOX(isDark), padding: 12 }}>Col {i}</div>)}
  </div>
);

export interface FourColumnGridProps extends BaseElementProps { gap?: number; }
export const FourColumnGrid: React.FC<FourColumnGridProps> = ({ gap = 6, isDark = false, className = '', style }) => (
  <div className={className} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap, width: '100%', ...style }}>
    {[1, 2, 3, 4].map(i => <div key={i} style={{ ...BOX(isDark), padding: 10, fontSize: 10 }}>Col {i}</div>)}
  </div>
);

export interface SplitScreenProps extends BaseElementProps { leftLabel?: string; rightLabel?: string; }
export const SplitScreen: React.FC<SplitScreenProps> = ({ leftLabel = 'Left', rightLabel = 'Right', isDark = false, className = '', style }) => (
  <div className={className} style={{ display: 'flex', width: '100%', gap: 8, ...style }}>
    <div style={{ flex: 1, ...BOX(isDark, '#7c3aed'), padding: 16 }}>{leftLabel}</div>
    <div style={{ width: 1, background: isDark ? '#2a2d45' : '#e5e7eb' }} />
    <div style={{ flex: 1, ...BOX(isDark, '#db2777'), padding: 16 }}>{rightLabel}</div>
  </div>
);

export interface HeaderBarProps extends BaseElementProps { title?: string; showLogo?: boolean; }
export const HeaderBar: React.FC<HeaderBarProps> = ({ title = 'My Application', showLogo = true, isDark = false, className = '', style }) => {
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const textColor = isDark ? '#f1f5f9' : '#111827';
  return (
    <div className={className} style={{ width: '100%', height: 52, background: bg, border: `1px solid ${border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showLogo && <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>}
        <span style={{ fontWeight: 700, fontSize: 15, color: textColor }}>{title}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {['Home', 'About', 'Docs'].map(item => <span key={item} style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280', cursor: 'default' }}>{item}</span>)}
      </div>
    </div>
  );
};

export interface FooterBarProps extends BaseElementProps { brand?: string; }
export const FooterBar: React.FC<FooterBarProps> = ({ brand = '© 2025 Cliply. All rights reserved.', isDark = false, className = '', style }) => {
  const bg = isDark ? '#1e2235' : '#f9fafb';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const textColor = isDark ? '#64748b' : '#9ca3af';
  return (
    <div className={className} style={{ width: '100%', background: bg, borderTop: `1px solid ${border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, ...style }}>
      <span style={{ fontSize: 12, color: textColor }}>{brand}</span>
    </div>
  );
};

export interface SidebarProps extends BaseElementProps { items?: string[]; side?: 'left' | 'right'; }
export const Sidebar: React.FC<SidebarProps> = ({ items = ['Dashboard', 'Analytics', 'Users', 'Settings'], isDark = false, className = '', style }) => {
  const bg = isDark ? '#1e2235' : '#f9fafb';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  const activeColor = '#7c3aed';
  return (
    <div className={className} style={{ width: 180, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      {items.map((item, i) => (
        <div key={item} style={{ padding: '9px 16px', fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? activeColor : textColor, background: i === 0 ? activeColor + '15' : 'transparent', borderRadius: 6, margin: '0 4px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
          <span style={{ fontSize: 15 }}>{['📊', '📈', '👥', '⚙'][i] ?? '•'}</span>{item}
        </div>
      ))}
    </div>
  );
};
