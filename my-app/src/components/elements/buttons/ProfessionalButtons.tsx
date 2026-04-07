import React from 'react';

// ============================================
// 10 PROFESSIONAL BUTTON DESIGNS
// React + Tailwind CSS - NO Animation
// Compatible with your React + Tailwind stack
// ============================================

// 1. PILL BUTTON - Fully rounded, modern
export const PillButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-3 
      bg-slate-900 text-white 
      rounded-full 
      font-medium text-sm
      hover:bg-slate-800
      active:scale-[0.98]
      transition-colors duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 2. SQUIRCLE BUTTON - Super rounded corners (iOS style)
export const SquircleButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-3.5
      bg-indigo-600 text-white
      rounded-[1.25rem]
      font-semibold text-sm
      hover:bg-indigo-700
      active:bg-indigo-800
      transition-colors duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 3. GHOST BUTTON - Transparent with border
export const GhostButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-2.5
      bg-transparent text-slate-700
      border-2 border-slate-300
      rounded-lg
      font-medium text-sm
      hover:bg-slate-50 hover:border-slate-400
      active:bg-slate-100
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 4. SOFT SHADOW BUTTON - Elevated with soft shadow
export const SoftShadowButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-7 py-3
      bg-white text-slate-800
      rounded-xl
      font-medium text-sm
      shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)]
      hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]
      hover:-translate-y-0.5
      active:translate-y-0
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 5. GRADIENT BUTTON - Beautiful gradient background
export const GradientButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-3
      bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500
      text-white
      rounded-lg
      font-semibold text-sm
      hover:from-violet-700 hover:via-purple-700 hover:to-pink-600
      shadow-lg shadow-purple-500/30
      active:shadow-md
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 6. OUTLINE GLOW BUTTON - Border with glow effect
export const OutlineGlowButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-7 py-2.5
      bg-transparent text-cyan-600
      border-2 border-cyan-500
      rounded-lg
      font-semibold text-sm
      hover:bg-cyan-50
      hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
      active:bg-cyan-100
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 7. GLASSMORPHISM BUTTON - Frosted glass effect
export const GlassButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-7 py-3
      bg-white/10 backdrop-blur-md
      text-white
      border border-slate-200
      rounded-xl
      font-medium text-sm
      hover:bg-slate-50
      hover:border-slate-300
      active:bg-slate-100
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 8. NEUMORPHIC BUTTON - Soft 3D raised effect
export const NeumorphicButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-3
      bg-[#e0e5ec] text-slate-700
      rounded-xl
      font-semibold text-sm
      shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]
      hover:shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]
      active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff]
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 9. DASHED BORDER BUTTON - Creative dashed outline
export const DashedButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-2.5
      bg-transparent text-emerald-600
      border-2 border-dashed border-emerald-500
      rounded-lg
      font-medium text-sm
      hover:bg-emerald-50
      hover:border-solid
      active:bg-emerald-100
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// 10. 3D BEVEL BUTTON - Classic 3D button with depth
export const BevelButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`
      px-7 py-3
      bg-blue-600 text-white
      rounded-lg
      font-bold text-sm
      border-b-4 border-blue-800
      hover:bg-blue-500
      hover:border-blue-700
      active:border-b-0
      active:translate-y-1
      transition-all duration-100
      ${className}
    `}
  >
    {children}
  </button>
);
