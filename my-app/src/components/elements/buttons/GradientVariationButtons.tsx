// @ts-nocheck
// ============================================
// SET 5: GRADIENT VARIATIONS (12 buttons)
// ============================================

export const LinearGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-cyan-600 transition-all ${className}`}>
    {children}
  </button>
);

export const DiagonalGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 text-white rounded-lg font-semibold text-sm hover:from-rose-600 hover:via-purple-600 hover:to-indigo-600 transition-all ${className}`}>
    {children}
  </button>
);

export const RadialGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'radial-gradient(circle at 30% 30%, #f472b6, #db2777, #be185d)'}}>
    {children}
  </button>
);

export const ConicGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'conic-gradient(from 0deg at 50% 50%, #f59e0b, #ef4444, #8b5cf6, #06b6d4, #10b981, #f59e0b)'}}>
    {children}
  </button>
);

export const StripedGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'repeating-linear-gradient(45deg, #6366f1, #6366f1 10px, #4f46e5 10px, #4f46e5 20px)'}}>
    {children}
  </button>
);

export const MeshGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'}}>
    {children}
  </button>
);

export const AuroraGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)'}}>
    {children}
  </button>
);

export const SunsetGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)'}}>
    {children}
  </button>
);

export const OceanGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%)'}}>
    {children}
  </button>
);

export const FireGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)'}}>
    {children}
  </button>
);

export const PastelGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'}}>
    {children}
  </button>
);

export const DarkGradientButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(to right, #434343 0%, black 100%)'}}>
    {children}
  </button>
);
