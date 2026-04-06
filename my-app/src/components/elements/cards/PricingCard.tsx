import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface PricingCardProps extends BaseElementProps {
  plan?: string;
  price?: string;
  period?: string;
  features?: string[];
  ctaLabel?: string;
  accentColor?: string;
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan = 'Pro Plan',
  price = '$29',
  period = '/month',
  features = ['Unlimited projects', '10GB Storage', 'Priority support', 'Advanced analytics'],
  ctaLabel = 'Get Started',
  accentColor = '#7c3aed',
  isPopular = true,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isPopular ? accentColor : (isDark ? '#2a2d45' : '#e5e7eb');
  const titleColor = isDark ? '#f1f5f9' : '#111827';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ background: bg, border: `2px solid ${border}`, borderRadius: 16, padding: 24, boxShadow: isPopular ? `0 4px 24px ${accentColor}33` : '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', ...style }}
    >
      {isPopular && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: accentColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>POPULAR</div>
      )}
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{plan}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, margin: '12px 0' }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: titleColor }}>{price}</span>
        <span style={{ fontSize: 14, color: textColor }}>{period}</span>
      </div>
      <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: textColor }}>
            <span style={{ color: accentColor, fontSize: 16 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      <button style={{ width: '100%', padding: '10px 0', borderRadius: 10, background: accentColor, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>{ctaLabel}</button>
    </motion.div>
  );
};
