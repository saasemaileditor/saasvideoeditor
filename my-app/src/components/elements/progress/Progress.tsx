import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

// ── Progress Bar ──────────────────────────────────────────
export interface ProgressBarProps extends BaseElementProps {
  value?: number;
  max?: number;
  label?: string;
  accentColor?: string;
  showPercentage?: boolean;
  height?: number;
  borderRadius?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value = 65, max = 100, label = 'Progress', accentColor = '#7c3aed', showPercentage = true, height = 8, borderRadius = 4, isDark = false, className = '', style }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const trackColor = isDark ? '#2a2d45' : '#e5e7eb';
  const textColor = isDark ? '#94a3b8' : '#374151';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && <span style={{ fontSize: 13, fontWeight: 500, color: textColor }}>{label}</span>}
        {showPercentage && <span style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>{Math.round(pct)}%</span>}
      </div>
      <div style={{ height, background: trackColor, borderRadius }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 0 6px ${accentColor}55` }} />
      </div>
    </div>
  );
};

// ── Step Indicator ──────────────────────────────────────────
export interface StepIndicatorProps extends BaseElementProps {
  steps?: string[];
  currentStep?: number;
  accentColor?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps = ['Info', 'Details', 'Review', 'Done'], currentStep = 2, accentColor = '#7c3aed', isDark = false, className = '', style }) => {
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  const connectorColor = isDark ? '#2a2d45' : '#e5e7eb';
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 0, ...style }}>
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isActive = i === currentStep;
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.2, delay: i * 0.05 }}
                style={{ width: 28, height: 28, borderRadius: '50%', background: isComplete || isActive ? accentColor : (isDark ? '#2a2d45' : '#e5e7eb'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: isComplete || isActive ? '#fff' : textColor, fontWeight: 700, boxShadow: isActive ? `0 0 0 4px ${accentColor}33` : 'none' }}>
                {isComplete ? '✓' : i + 1}
              </motion.div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? accentColor : textColor, whiteSpace: 'nowrap' }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentStep ? accentColor : connectorColor, margin: '0 4px', marginTop: -14 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Loading Spinner ──────────────────────────────────────────
export interface LoadingSpinnerProps extends BaseElementProps {
  size?: number;
  accentColor?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, accentColor = '#7c3aed', label = 'Loading...', isDark = false, className = '', style }) => {
  const trackColor = isDark ? '#2a2d45' : '#e5e7eb';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ width: size, height: size, position: 'relative' }}>
        <svg width={size} height={size} viewBox="0 0 50 50" style={{ animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg) } }`}</style>
          <circle cx="25" cy="25" r="20" fill="none" stroke={trackColor} strokeWidth="4" />
          <circle cx="25" cy="25" r="20" fill="none" stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeDasharray="100 157" />
        </svg>
      </div>
      {label && <span style={{ fontSize: 13, color: textColor, fontWeight: 500 }}>{label}</span>}
    </div>
  );
};

// ── Skeleton Line ──────────────────────────────────────────
export interface SkeletonLineProps extends BaseElementProps {
  lines?: number;
  avatarSize?: number;
  showAvatar?: boolean;
}

export const SkeletonLine: React.FC<SkeletonLineProps> = ({ lines = 3, avatarSize = 40, showAvatar = true, isDark = false, className = '', style }) => {
  const bg = isDark ? '#2a2d45' : '#e5e7eb';
  const shimmer = isDark ? '#374151' : '#f3f4f6';
  return (
    <div className={className} style={{ display: 'flex', gap: 12, padding: 12, ...style }}>
      {showAvatar && (
        <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', background: bg, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${shimmer}, transparent)` }} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ height: 12, background: bg, borderRadius: 6, width: i === lines - 1 ? '60%' : '100%', position: 'relative', overflow: 'hidden' }}>
            <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.1 }} style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${shimmer}, transparent)` }} />
          </div>
        ))}
      </div>
    </div>
  );
};
