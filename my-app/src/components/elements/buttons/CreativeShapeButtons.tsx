// @ts-nocheck
// ============================================
// SET 2: CREATIVE SHAPES (12 buttons)
// ============================================

export const ArrowButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-8 py-3 bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors clip-path-arrow ${className}`} style={{clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)'}}>
    {children}
  </button>
);

export const HexagonButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-6 py-3 bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors ${className}`} style={{clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)'}}>
    {children}
  </button>
);

export const OctagonButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-7 py-3 bg-pink-600 text-white font-semibold text-sm hover:bg-pink-700 transition-colors ${className}`} style={{clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'}}>
    {children}
  </button>
);

export const DiamondButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-8 py-4 bg-cyan-600 text-white font-semibold text-sm hover:bg-cyan-700 transition-colors ${className}`} style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}>
    {children}
  </button>
);

export const TrapezoidButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-8 py-3 bg-lime-600 text-white font-semibold text-sm hover:bg-lime-700 transition-colors ${className}`} style={{clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'}}>
    {children}
  </button>
);

export const ParallelogramButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-8 py-3 bg-fuchsia-600 text-white font-semibold text-sm hover:bg-fuchsia-700 transition-colors ${className}`} style={{clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)'}}>
    {children}
  </button>
);

export const NotchedButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-7 py-3 bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition-colors ${className}`} style={{clipPath: 'polygon(0% 0%, calc(100% - 15px) 0%, 100% 15px, 100% 100%, 0% 100%)'}}>
    {children}
  </button>
);

export const DoubleNotchedButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-7 py-3 bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors ${className}`} style={{clipPath: 'polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)'}}>
    {children}
  </button>
);

export const ChevronButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-8 py-3 bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors ${className}`} style={{clipPath: 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)'}}>
    {children}
  </button>
);

export const TagButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-7 py-3 bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition-colors ${className}`} style={{clipPath: 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)'}}>
    {children}
  </button>
);

export const ShieldButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-7 py-3 bg-indigo-700 text-white font-semibold text-sm hover:bg-indigo-800 transition-colors ${className}`} style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}>
    {children}
  </button>
);

export const RoundedTabButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-amber-600 text-white rounded-t-2xl rounded-b-none font-semibold text-sm hover:bg-amber-700 transition-colors ${className}`}>
    {children}
  </button>
);
