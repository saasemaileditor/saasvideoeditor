// @ts-nocheck
// ============================================
// SET 3: BORDER STYLES (12 buttons)
// ============================================

export const DottedBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-transparent text-purple-600 border-2 border-dotted border-purple-500 rounded-lg font-medium text-sm hover:bg-purple-50 transition-all ${className}`}>
    {children}
  </button>
);

export const DoubleBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-transparent text-blue-600 border-4 border-double border-blue-500 rounded-lg font-medium text-sm hover:bg-blue-50 transition-all ${className}`}>
    {children}
  </button>
);

export const GrooveBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-gray-100 text-gray-700 border-4 border-groove border-gray-400 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all ${className}`}>
    {children}
  </button>
);

export const RidgeBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-gray-100 text-gray-700 border-4 border-ridge border-gray-400 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all ${className}`}>
    {children}
  </button>
);

export const InsetBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-gray-200 text-gray-700 border-4 border-gray-400 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all ${className}`} style={{borderStyle: 'inset'}}>
    {children}
  </button>
);

export const OutsetBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-gray-200 text-gray-700 border-4 border-gray-400 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all ${className}`} style={{borderStyle: 'outset'}}>
    {children}
  </button>
);

export const ThickBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-transparent text-rose-600 border-[6px] border-rose-500 rounded-lg font-bold text-sm hover:bg-rose-50 transition-all ${className}`}>
    {children}
  </button>
);

export const GradientBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-6 py-2.5 bg-white text-slate-800 rounded-lg font-medium text-sm before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-cyan-500 before:rounded-lg before:-z-10 hover:bg-slate-50 transition-all ${className}`}>
    {children}
  </button>
);

export const GlowBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.8)] transition-all ${className}`}>
    {children}
  </button>
);

export const TopBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-transparent text-teal-600 border-t-4 border-teal-500 font-medium text-sm hover:bg-teal-50 transition-all ${className}`}>
    {children}
  </button>
);

export const BottomBorderButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2.5 bg-transparent text-orange-600 border-b-4 border-orange-500 font-medium text-sm hover:bg-orange-50 transition-all ${className}`}>
    {children}
  </button>
);

export const PillOutlineButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-2.5 bg-transparent text-slate-700 border-2 border-slate-400 rounded-full font-medium text-sm hover:bg-slate-100 hover:border-slate-600 transition-all ${className}`}>
    {children}
  </button>
);
