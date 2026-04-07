// @ts-nocheck
// ============================================
// SET 6: TEXTURE & PATTERN (12 buttons)
// ============================================

export const DotsPatternButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: 'white', backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '12px 12px'}}>
    {children}
  </button>
);

export const GridPatternButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: 'white', backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '16px 16px'}}>
    {children}
  </button>
);

export const DiagonalLinesButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px)'}}>
    {children}
  </button>
);

export const CarbonFiberButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px, linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px, linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px, linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px, linear-gradient(90deg, #1b1b1b 10px, transparent 10px), linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424)', backgroundColor: '#131313', backgroundSize: '20px 20px'}}>
    {children}
  </button>
);

export const NoiseTextureButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: '#f8fafc', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.1%22/%3E%3C/svg%3E")'}}>
    {children}
  </button>
);

export const StripedPatternButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'repeating-linear-gradient(-45deg, #3b82f6, #3b82f6 10px, #2563eb 10px, #2563eb 20px)'}}>
    {children}
  </button>
);

export const CheckerboardButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: 'repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%)', backgroundSize: '20px 20px'}}>
    {children}
  </button>
);

export const WavesPatternButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'repeating-radial-gradient(circle at 0 0, transparent 0, #0891b2 10px), repeating-linear-gradient(to right, #06b6d4, #0891b2)'}}>
    {children}
  </button>
);

export const PolkaDotsButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: '#fef3c7', backgroundImage: 'radial-gradient(#f59e0b 20%, transparent 20%)', backgroundSize: '16px 16px'}}>
    {children}
  </button>
);

export const HoneycombButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-amber-900 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: 'radial-gradient(circle farthest-side at 0% 50%, #fb923c 23.5%, rgba(240, 166, 17, 0) 0) 21px 30px, radial-gradient(circle farthest-side at 0% 50%, #b45309 24%, rgba(240, 166, 17, 0) 0) 19px 30px, linear-gradient(#fb923c 14%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 85%, #fb923c 0) 0 0, linear-gradient(150deg, #fb923c 24%, #b45309 0, #b45309 26%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 74%, #b45309 0, #b45309 76%, #fb923c 0) 0 0, linear-gradient(30deg, #fb923c 24%, #b45309 0, #b45309 26%, rgba(240, 166, 17, 0) 0, rgba(240, 166, 17, 0) 74%, #b45309 0, #b45309 76%, #fb923c 0) 0 0, linear-gradient(90deg, #b45309 2%, #fb923c 0, #fb923c 98%, #b45309 0%) 0 0 #fb923c', backgroundSize: '40px 60px'}}>
    {children}
  </button>
);

export const ZigzagButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all ${className}`} style={{background: 'linear-gradient(135deg, #ec4899 25%, transparent 25%) -10px 0, linear-gradient(225deg, #ec4899 25%, transparent 25%) -10px 0, linear-gradient(315deg, #ec4899 25%, transparent 25%), linear-gradient(45deg, #ec4899 25%, transparent 25%)', backgroundSize: '20px 20px', backgroundColor: '#db2777'}}>
    {children}
  </button>
);

export const CrosshatchButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 text-slate-800 rounded-lg font-semibold text-sm hover:brightness-95 transition-all ${className}`} style={{background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #e2e8f0 5px, #e2e8f0 10px), repeating-linear-gradient(-45deg, transparent, transparent 5px, #e2e8f0 5px, #e2e8f0 10px)', backgroundColor: 'white'}}>
    {children}
  </button>
);
