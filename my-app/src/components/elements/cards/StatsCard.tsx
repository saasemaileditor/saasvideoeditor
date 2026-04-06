import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface StatsCardProps extends BaseElementProps {
  value?: string;
  label?: string;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: string;
  icon?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value = '24,892',
  label = 'Total Users',
  trend = '+12.5%',
  trendPositive = true,
  accentColor = '#7c3aed',
  icon = '👥',
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const titleColor = isDark ? '#f1f5f9' : '#111827';
  const subColor = isDark ? '#94a3b8' : '#6b7280';
  const trendColor = trendPositive ? '#22c55e' : '#ef4444';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)', ...style }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: subColor, fontWeight: 500 }}>{label}</p>
          <p style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 800, color: titleColor, lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: accentColor + '1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      </div>
      {trend && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: trendColor }}>{trend}</span>
          <span style={{ fontSize: 12, color: subColor }}>vs last month</span>
        </div>
      )}
    </motion.div>
  );
};
