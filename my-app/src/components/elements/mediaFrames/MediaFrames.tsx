import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface MediaFrameProps extends BaseElementProps {
  width?: number;
  height?: number;
  label?: string;
  accentColor?: string;
}

// ── Image Placeholder ──────────────────────────────────────────
export const ImagePlaceholder: React.FC<MediaFrameProps> = ({ width = 280, height = 180, isDark = false, label = 'Image', className = '', style }) => {
  const bg = isDark ? '#1e2235' : '#f3f4f6';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={className}
      style={{ width, height, background: bg, border: `2px dashed ${border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, ...style }}>
      <span style={{ fontSize: 32 }}>🖼</span>
      <span style={{ fontSize: 12, color: isDark ? '#475569' : '#9ca3af', fontWeight: 500 }}>{label}</span>
    </motion.div>
  );
};

// ── Video Placeholder ──────────────────────────────────────────
export const VideoPlaceholder: React.FC<MediaFrameProps> = ({ width = 280, height = 180, isDark = false, label = 'Video', className = '', style }) => {
  const bg = isDark ? '#0f172a' : '#0f172a';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={className}
      style={{ width, height, background: bg, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, marginLeft: 3 }}>▶</span>
      </div>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</span>
    </motion.div>
  );
};

// ── Phone Mockup ──────────────────────────────────────────
export const PhoneMockup: React.FC<MediaFrameProps> = ({ width = 120, isDark = false, className = '', style }) => {
  const h = width * 2.1;
  const bg = isDark ? '#1e2235' : '#1f2937';
  const screenBg = isDark ? '#0f172a' : '#111827';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={className}
      style={{ width, height: h, background: bg, borderRadius: width * 0.18, border: `3px solid ${isDark ? '#374151' : '#374151'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${width*0.1}px ${width*0.07}px`, gap: width*0.05, position: 'relative', ...style }}>
      <div style={{ width: width * 0.3, height: width * 0.05, background: '#374151', borderRadius: 4 }} />
      <div style={{ flex: 1, width: '100%', background: screenBg, borderRadius: width * 0.1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: width * 0.25, opacity: 0.3 }}>📱</span>
      </div>
      <div style={{ width: width * 0.2, height: width * 0.2, borderRadius: '50%', border: '2px solid #374151' }} />
    </motion.div>
  );
};

// ── Laptop Mockup ──────────────────────────────────────────
export const LaptopMockup: React.FC<MediaFrameProps> = ({ width = 260, isDark = false, className = '', style }) => {
  const h = width * 0.65;
  const screenH = h * 0.82;
  const bg = isDark ? '#2a2d45' : '#e5e7eb';
  const screenBg = isDark ? '#0f172a' : '#111827';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={className} style={{ width, ...style }}>
      <div style={{ width, height: screenH, background: bg, borderRadius: '10px 10px 0 0', padding: '8px 6px 4px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '100%', height: '100%', background: screenBg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, opacity: 0.3 }}>💻</span>
        </div>
      </div>
      <div style={{ width: width * 1.1, height: 10, background: bg, borderRadius: '0 0 8px 8px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
    </motion.div>
  );
};

// ── Tablet Mockup ──────────────────────────────────────────
export const TabletMockup: React.FC<MediaFrameProps> = ({ width = 180, isDark = false, className = '', style }) => {
  const h = width * 1.35;
  const bg = isDark ? '#1e2235' : '#1f2937';
  const screenBg = isDark ? '#0f172a' : '#111827';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={className}
      style={{ width, height: h, background: bg, borderRadius: width * 0.09, border: `3px solid #374151`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${width*0.06}px ${width*0.05}px`, gap: width*0.04, ...style }}>
      <div style={{ width: width * 0.15, height: width * 0.04, background: '#374151', borderRadius: 4 }} />
      <div style={{ flex: 1, width: '100%', background: screenBg, borderRadius: width * 0.06, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: width * 0.2, opacity: 0.3 }}>🖥</span>
      </div>
      <div style={{ width: width * 0.12, height: width * 0.12, borderRadius: '50%', border: '2px solid #374151' }} />
    </motion.div>
  );
};

// ── Browser Window ──────────────────────────────────────────
export const BrowserWindow: React.FC<MediaFrameProps> = ({ width = 280, height = 180, isDark = false, className = '', style }) => {
  const chromeBg = isDark ? '#1e2235' : '#f3f4f6';
  const screenBg = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const dotColors = ['#ef4444', '#f59e0b', '#22c55e'];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={className}
      style={{ width, height, background: chromeBg, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>
      <div style={{ height: 32, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', borderBottom: `1px solid ${border}` }}>
        {dotColors.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <div style={{ flex: 1, background: isDark ? '#0f172a' : '#e5e7eb', borderRadius: 4, height: 16, marginLeft: 6, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ fontSize: 9, color: isDark ? '#475569' : '#9ca3af' }}>https://example.com</span>
        </div>
      </div>
      <div style={{ flex: 1, background: screenBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 24, opacity: 0.2 }}>🌐</span>
      </div>
    </motion.div>
  );
};
