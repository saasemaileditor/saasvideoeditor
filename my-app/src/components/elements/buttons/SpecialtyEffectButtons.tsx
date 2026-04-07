// @ts-nocheck
// ============================================
// SET 9: SPECIALTY EFFECTS (12 buttons)
// ============================================

export const HolographicButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(135deg, #ff00cc, #333399, #00ffcc, #ff00cc)', backgroundSize: '400% 400%'}}>
    {children}
  </button>
);

export const IridescentButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #ff0080)', backgroundSize: '300% 300%'}}>
    {children}
  </button>
);

export const ChromeButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 font-bold text-sm rounded-lg hover:brightness-105 transition-all ${className}`} style={{background: 'linear-gradient(to bottom, #e8e8e8 0%, #a8a8a8 50%, #e8e8e8 100%)'}}>
    {children}
  </button>
);

export const GoldButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-amber-900 font-bold text-sm rounded-lg hover:brightness-105 transition-all ${className}`} style={{background: 'linear-gradient(to bottom, #ffd700 0%, #ffed4a 30%, #b8860b 70%, #ffd700 100%)'}}>
    {children}
  </button>
);

export const SilverButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-700 font-bold text-sm rounded-lg hover:brightness-105 transition-all ${className}`} style={{background: 'linear-gradient(to bottom, #f5f5f5 0%, #c0c0c0 50%, #f5f5f5 100%)'}}>
    {children}
  </button>
);

export const RoseGoldButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-rose-900 font-bold text-sm rounded-lg hover:brightness-105 transition-all ${className}`} style={{background: 'linear-gradient(to bottom, #f4c2c2 0%, #e6a8a8 50%, #d48888 100%)'}}>
    {children}
  </button>
);

export const LeatherButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-amber-100 font-bold text-sm rounded-lg hover:brightness-110 transition-all ${className}`} style={{background: '#8b4513', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'}}>
    {children}
  </button>
);

export const DenimButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all ${className}`} style={{background: 'repeating-linear-gradient(0deg, #1e3a5f, #1e3a5f 2px, #2d4a6f 2px, #2d4a6f 4px)'}}>
    {children}
  </button>
);

export const WoodButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-amber-100 font-bold text-sm rounded-lg hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(to right, #8b5a2b, #a0522d, #8b4513, #cd853f)'}}>
    {children}
  </button>
);

export const MarbleButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-700 font-bold text-sm rounded-lg hover:brightness-95 transition-all ${className}`} style={{background: '#f8f8f8', backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(200,200,200,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(180,180,180,0.2) 0%, transparent 40%)'}}>
    {children}
  </button>
);

export const FrostedGlassButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white font-semibold text-sm rounded-xl backdrop-blur-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all ${className}`}>
    {children}
  </button>
);

export const LiquidFillButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`relative px-8 py-3 text-blue-600 font-bold text-sm rounded-lg border-2 border-blue-600 overflow-hidden hover:text-white transition-colors ${className}`}>
    <span className="relative z-10">{children}</span>
    <span className="absolute inset-0 bg-blue-600 transform -translate-y-full hover:translate-y-0 transition-transform duration-300"></span>
  </button>
);
