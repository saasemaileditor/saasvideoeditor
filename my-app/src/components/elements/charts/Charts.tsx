import React, { useEffect, useState } from 'react';
import { motion, animate } from 'motion/react';
import type { BaseElementProps } from '../types';

// ── Bar Chart ──────────────────────────────────────────
export interface BarChartProps extends BaseElementProps {
  data?: { label: string; value: number; color?: string }[];
  title?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data = [
    { label: 'Jan', value: 60 },
    { label: 'Feb', value: 85 },
    { label: 'Mar', value: 45 },
    { label: 'Apr', value: 92 },
    { label: 'May', value: 70 },
    { label: 'Jun', value: 78 },
  ],
  title = 'Monthly Revenue',
  height = 160,
  isDark = false,
  className = '',
  style,
}) => {
  const maxVal = Math.max(...data.map(d => d.value));
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const textColor = isDark ? '#64748b' : '#9ca3af';
  const titleColor = isDark ? '#f1f5f9' : '#111827';
  const colors = ['#7c3aed', '#2563eb', '#db2777', '#059669', '#d97706', '#dc2626'];
  return (
    <div className={className} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 16, ...style }}>
      {title && <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: titleColor }}>{title}</p>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / maxVal) * (height - 24)}px` }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
              style={{ width: '100%', borderRadius: '4px 4px 0 0', background: d.color ?? colors[i % colors.length], minWidth: 0 }}
            />
            <span style={{ fontSize: 9, color: textColor, fontWeight: 500 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Line Chart ──────────────────────────────────────────
export interface LineChartProps extends BaseElementProps {
  data?: number[];
  labels?: string[];
  title?: string;
  accentColor?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data = [30, 55, 40, 80, 60, 90, 75],
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  title = 'Weekly Trend',
  accentColor = '#7c3aed',
  height = 140,
  isDark = false,
  className = '',
  style,
}) => {
  const svgW = 260;
  const svgH = height - 32;
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * svgW,
    y: svgH - ((v - minVal) / range) * svgH * 0.85 - 4,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L${svgW} ${svgH} L0 ${svgH} Z`;
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const titleColor = isDark ? '#f1f5f9' : '#111827';
  const textColor = isDark ? '#64748b' : '#9ca3af';
  return (
    <div className={className} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 16, overflow: 'hidden', ...style }}>
      {title && <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: titleColor }}>{title}</p>}
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH + 20}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineArea)" />
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }}
          d={pathD} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={accentColor} />
        ))}
        {labels.map((l, i) => (
          <text key={l} x={(i / (labels.length - 1)) * svgW} y={svgH + 16} textAnchor="middle" fontSize="9" fill={textColor}>{l}</text>
        ))}
      </svg>
    </div>
  );
};

// ── Pie Chart ──────────────────────────────────────────
export interface PieChartProps extends BaseElementProps {
  data?: { label: string; value: number; color: string }[];
  title?: string;
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data = [
    { label: 'Design', value: 35, color: '#7c3aed' },
    { label: 'Dev', value: 45, color: '#2563eb' },
    { label: 'Marketing', value: 20, color: '#db2777' },
  ],
  title = 'Team Distribution',
  size = 120,
  isDark = false,
  className = '',
  style,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumAngle = -90;
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const slices = data.map((d) => {
    const startAngle = cumAngle;
    const sweep = (d.value / total) * 360;
    cumAngle += sweep;
    const r2d = Math.PI / 180;
    const x1 = cx + r * Math.cos(startAngle * r2d);
    const y1 = cy + r * Math.sin(startAngle * r2d);
    const x2 = cx + r * Math.cos((startAngle + sweep) * r2d);
    const y2 = cy + r * Math.sin((startAngle + sweep) * r2d);
    const largeArc = sweep > 180 ? 1 : 0;
    return { ...d, path: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const titleColor = isDark ? '#f1f5f9' : '#111827';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      {title && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: titleColor }}>{title}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={size} height={size} style={{ flexShrink: 0 }}>
          {slices.map((s, i) => (
            <motion.path key={s.label} d={s.path} fill={s.color} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: i * 0.1 }} />
          ))}
          <circle cx={cx} cy={cy} r={r * 0.45} fill={bg} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.map((d) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: textColor }}>{d.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: titleColor, marginLeft: 'auto' }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Number Counter ──────────────────────────────────────────
export interface NumberCounterProps extends BaseElementProps {
  value?: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  accentColor?: string;
  fontSize?: number;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value = 94520,
  label = 'Total Downloads',
  prefix = '',
  suffix = '+',
  accentColor = '#7c3aed',
  fontSize = 42,
  isDark = false,
  className = '',
  style,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return controls.stop;
  }, [value]);
  const labelColor = isDark ? '#94a3b8' : '#6b7280';
  const numColor = isDark ? '#f1f5f9' : '#111827';
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  return (
    <div className={className} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, textAlign: 'center', ...style }}>
      <div style={{ fontSize, fontWeight: 900, color: numColor, lineHeight: 1 }}>
        <span style={{ color: accentColor }}>{prefix}</span>
        {displayValue.toLocaleString()}
        <span style={{ color: accentColor }}>{suffix}</span>
      </div>
      {label && <p style={{ margin: '8px 0 0', fontSize: 14, color: labelColor, fontWeight: 500 }}>{label}</p>}
    </div>
  );
};
