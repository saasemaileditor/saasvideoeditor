// @ts-nocheck
// ============================================
// SET 8: MODERN UI TRENDS (12 buttons)
// ============================================

export const BentoButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-white text-slate-800 font-medium text-sm rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all ${className}`}>
    {children}
  </button>
);

export const AppleStyleButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-2.5 bg-blue-500 text-white font-medium text-sm rounded-full hover:bg-blue-600 transition-all ${className}`}>
    {children}
  </button>
);

export const MaterialYouButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-teal-600 text-white font-medium text-sm rounded-2xl hover:bg-teal-700 hover:shadow-lg transition-all ${className}`}>
    {children}
  </button>
);

export const FluentButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 transition-all ${className}`}>
    {children}
  </button>
);

export const BrutalistButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-white text-black font-bold text-sm border-4 border-black hover:bg-black hover:text-white transition-all ${className}`}>
    {children}
  </button>
);

export const SwissButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-red-600 text-white font-bold text-sm tracking-tight hover:bg-red-700 transition-all ${className}`}>
    {children}
  </button>
);

export const MinimalLineButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2 bg-transparent text-slate-900 font-medium text-sm border-b-2 border-slate-900 hover:bg-slate-100 transition-all ${className}`}>
    {children}
  </button>
);

export const FloatingActionButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`w-14 h-14 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-pink-600 hover:shadow-xl transition-all ${className}`}>
    {children}
  </button>
);

export const ChipButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all ${className}`}>
    {children}
  </button>
);

export const SegmentedButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2 bg-slate-200 text-slate-700 font-medium text-sm first:rounded-l-lg last:rounded-r-lg hover:bg-slate-300 transition-all ${className}`}>
    {children}
  </button>
);

export const TogglePillButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-2 bg-slate-800 text-white font-medium text-sm rounded-full hover:bg-slate-700 transition-all ${className}`}>
    {children}
  </button>
);

export const CardButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-4 bg-white text-slate-800 font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all ${className}`}>
    {children}
  </button>
);
