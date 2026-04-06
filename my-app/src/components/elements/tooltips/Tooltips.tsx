import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends BaseElementProps {
  placement?: TooltipPlacement;
  text?: string;
  label?: string;
  accentColor?: string;
}

const TRIANGLE: Record<TooltipPlacement, React.CSSProperties> = {
  top: { bottom: -6, left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid', width: 0, height: 0 },
  bottom: { top: -6, left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid', width: 0, height: 0 },
  left: { right: -6, top: '50%', transform: 'translateY(-50%)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid', width: 0, height: 0 },
  right: { left: -6, top: '50%', transform: 'translateY(-50%)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '6px solid', width: 0, height: 0 },
};

const WRAPPER_FLEX: Record<TooltipPlacement, React.CSSProperties> = {
  top: { flexDirection: 'column', alignItems: 'center' },
  bottom: { flexDirection: 'column-reverse', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center' },
  right: { flexDirection: 'row-reverse', alignItems: 'center' },
};

export const Tooltip: React.FC<TooltipProps> = ({
  placement = 'top',
  text = 'Helpful tooltip text',
  label = 'Hover me',

  isDark = false,
  className = '',
  style,
}) => {
  const tooltipBg = isDark ? '#f1f5f9' : '#1e293b';
  const tooltipText = isDark ? '#1e293b' : '#f1f5f9';
  const gap = 8;
  return (
    <div className={className} style={{ display: 'inline-flex', ...WRAPPER_FLEX[placement], gap, ...style }}>
      <div style={{ position: 'relative', background: tooltipBg, color: tooltipText, fontSize: 12, fontWeight: 500, padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
        {text}
        <div style={{ position: 'absolute', ...TRIANGLE[placement], borderTopColor: tooltipBg, borderBottomColor: tooltipBg, borderLeftColor: tooltipBg, borderRightColor: tooltipBg }} />
      </div>
      <motion.div whileHover={{ scale: 1.03 }} style={{ padding: '7px 14px', background: isDark ? '#2a2d45' : '#f3f4f6', borderRadius: 8, fontSize: 13, fontWeight: 500, color: isDark ? '#e2e8f0' : '#374151', cursor: 'default', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }}>
        {label}
      </motion.div>
    </div>
  );
};

export const TopTooltip: React.FC<Omit<TooltipProps, 'placement'>> = (p) => <Tooltip {...p} placement="top" text={p.text ?? 'Top tooltip'} />;
export const BottomTooltip: React.FC<Omit<TooltipProps, 'placement'>> = (p) => <Tooltip {...p} placement="bottom" text={p.text ?? 'Bottom tooltip'} />;
export const LeftTooltip: React.FC<Omit<TooltipProps, 'placement'>> = (p) => <Tooltip {...p} placement="left" text={p.text ?? 'Left tooltip'} />;
export const RightTooltip: React.FC<Omit<TooltipProps, 'placement'>> = (p) => <Tooltip {...p} placement="right" text={p.text ?? 'Right tooltip'} />;
