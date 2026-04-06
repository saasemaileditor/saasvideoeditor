import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface ProfileCardProps extends BaseElementProps {
  name?: string;
  role?: string;
  bio?: string;
  avatarInitials?: string;
  avatarColor?: string;
  followers?: string;
  following?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name = 'Alex Rivera',
  role = 'Senior Designer',
  bio = 'Creating beautiful digital experiences. Passionate about color theory and motion design.',
  avatarInitials = 'AR',
  avatarColor = '#7c3aed',
  followers = '14.2K',
  following = '892',
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#ffffff';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const nameColor = isDark ? '#f1f5f9' : '#111827';
  const subColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 24, boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', ...style }}
    >
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${avatarColor}, #db2777)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 auto 12px' }}>{avatarInitials}</div>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: nameColor }}>{name}</h3>
      <p style={{ margin: '4px 0 10px', fontSize: 13, color: avatarColor, fontWeight: 500 }}>{role}</p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: subColor, lineHeight: 1.5 }}>{bio}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, borderTop: `1px solid ${isDark ? '#2a2d45' : '#f3f4f6'}`, paddingTop: 16 }}>
        {[{ label: 'Followers', value: followers }, { label: 'Following', value: following }].map((item) => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: nameColor }}>{item.value}</div>
            <div style={{ fontSize: 11, color: subColor }}>{item.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
