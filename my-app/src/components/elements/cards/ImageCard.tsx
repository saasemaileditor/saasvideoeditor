import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface ImageCardProps extends BaseElementProps {
  title?: string;
  subtitle?: string;
  overlayColor?: string;
  imageBg?: string;
  imageEmoji?: string;
  aspectRatio?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  title = 'Image Title',
  subtitle = 'Overlay caption text',
  overlayColor = 'rgba(0,0,0,0.55)',
  imageBg = 'linear-gradient(135deg, #7c3aed, #2563eb)',
  imageEmoji = '🎨',
  aspectRatio = '16/9',

  className = '',
  style,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ borderRadius: 14, overflow: 'hidden', aspectRatio, position: 'relative', ...style }}
    >
      <div style={{ position: 'absolute', inset: 0, background: imageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>{imageEmoji}</div>
      <div style={{ position: 'absolute', inset: 0, background: overlayColor }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 16px', color: '#fff' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.8 }}>{subtitle}</p>
      </div>
    </motion.div>
  );
};
