// @ts-nocheck
// ============================================
// SET 4: SHADOW EFFECTS (12 buttons)
// ============================================

export const HardShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-yellow-400 text-slate-900 rounded-lg font-bold text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${className}`}>
    {children}
  </button>
);

export const ColoredShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-white text-purple-600 rounded-lg font-semibold text-sm shadow-[0_8px_30px_rgba(147,51,234,0.4)] hover:shadow-[0_12px_40px_rgba(147,51,234,0.6)] transition-all ${className}`}>
    {children}
  </button>
);

export const InnerShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_3px_12px_rgba(0,0,0,0.2)] transition-all ${className}`}>
    {children}
  </button>
);

export const LiftedShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-white text-slate-800 rounded-lg font-medium text-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all ${className}`}>
    {children}
  </button>
);

export const BottomShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-emerald-500 text-white rounded-lg font-semibold text-sm shadow-[0_10px_0px_0px_rgba(6,95,70,1)] active:shadow-none active:translate-y-[10px] transition-all ${className}`}>
    {children}
  </button>
);

export const BlurShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-7 py-3 bg-white text-slate-800 rounded-xl font-medium text-sm before:absolute before:inset-0 before:bg-pink-500 before:rounded-xl before:blur-xl before:opacity-40 before:-z-10 hover:before:opacity-60 transition-all ${className}`}>
    {children}
  </button>
);

export const DoubleShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-sm shadow-[0_4px_0px_0px_rgba(55,48,163,1),0_8px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_3px_0px_0px_rgba(55,48,163,1),0_6px_12px_rgba(0,0,0,0.2)] hover:translate-y-[1px] transition-all ${className}`}>
    {children}
  </button>
);

export const NeonShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-slate-900 text-cyan-400 rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.5),0_0_40px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7),0_0_60px_rgba(34,211,238,0.5)] transition-all ${className}`}>
    {children}
  </button>
);

export const SpreadShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-rose-500 text-white rounded-lg font-semibold text-sm shadow-[0_0_0_4px_rgba(244,63,94,0.3)] hover:shadow-[0_0_0_8px_rgba(244,63,94,0.2)] transition-all ${className}`}>
    {children}
  </button>
);

export const OffsetShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-amber-400 text-slate-900 rounded-lg font-bold text-sm shadow-[8px_8px_0px_0px_rgba(251,191,36,0.5)] border-2 border-slate-900 hover:shadow-[6px_6px_0px_0px_rgba(251,191,36,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${className}`}>
    {children}
  </button>
);

export const GlowShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-bold text-sm shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] transition-all ${className}`}>
    {children}
  </button>
);

export const LayeredShadowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-white text-slate-800 rounded-lg font-medium text-sm shadow-[0_2px_0px_#e2e8f0,0_4px_0px_#cbd5e1,0_6px_0px_#94a3b8,0_8px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0px_#e2e8f0,0_4px_0px_#cbd5e1,0_6px_0px_#94a3b8,0_7px_8px_rgba(0,0,0,0.2)] hover:translate-y-[1px] transition-all ${className}`}>
    {children}
  </button>
);
