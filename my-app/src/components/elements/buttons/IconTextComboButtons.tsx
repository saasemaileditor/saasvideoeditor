// @ts-nocheck
// ============================================
// SET 10: ICON & TEXT COMBOS (12 buttons)
// ============================================

export const IconLeftButton = ({ children, icon, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-all ${className}`}>
    {icon && <span>{icon}</span>}
    {children}
  </button>
);

export const IconRightButton = ({ children, icon, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-all ${className}`}>
    {children}
    {icon && <span>{icon}</span>}
  </button>
);

export const IconOnlyCircleButton = ({ icon, onClick, className = "" }) => (
  <button onClick={onClick} className={`w-12 h-12 flex items-center justify-center bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all ${className}`}>
    {icon}
  </button>
);

export const IconOnlySquareButton = ({ icon, onClick, className = "" }) => (
  <button onClick={onClick} className={`w-12 h-12 flex items-center justify-center bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all ${className}`}>
    {icon}
  </button>
);

export const ExpandableIconButton = ({ children, icon, onClick, className = "" }) => (
  <button onClick={onClick} className={`group flex items-center gap-2 px-4 py-3 bg-purple-600 text-white font-medium text-sm rounded-full hover:bg-purple-700 transition-all ${className}`}>
    {icon && <span className="group-hover:mr-1 transition-all">{icon}</span>}
    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">{children}</span>
  </button>
);

export const StackedIconButton = ({ children, icon, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 px-6 py-3 bg-slate-800 text-white font-medium text-sm rounded-lg hover:bg-slate-700 transition-all ${className}`}>
    {icon && <span className="text-xl">{icon}</span>}
    <span>{children}</span>
  </button>
);

export const BadgeCountButton = ({ children, count, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-6 py-3 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-all ${className}`}>
    {children}
    {count && <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{count}</span>}
  </button>
);

export const LoadingButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 bg-slate-400 text-white font-medium text-sm rounded-lg cursor-not-allowed ${className}`} disabled>
    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
    {children}
  </button>
);

export const SuccessButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-medium text-sm rounded-lg hover:bg-green-600 transition-all ${className}`}>
    <span>✓</span>
    {children}
  </button>
);

export const ErrorButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-medium text-sm rounded-lg hover:bg-red-600 transition-all ${className}`}>
    <span>✕</span>
    {children}
  </button>
);

export const ArrowIndicatorButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`group flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium text-sm rounded-lg hover:bg-teal-700 transition-all ${className}`}>
    {children}
    <span className="group-hover:translate-x-1 transition-transform">→</span>
  </button>
);

export const DropdownButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-medium text-sm rounded-lg hover:bg-gray-600 transition-all ${className}`}>
    {children}
    <span>▼</span>
  </button>
);
