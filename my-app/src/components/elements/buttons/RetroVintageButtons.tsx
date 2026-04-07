// @ts-nocheck
// ============================================
// SET 7: RETRO & VINTAGE (12 buttons)
// ============================================

export const RetroPixelButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all ${className}`} style={{boxShadow: '4px 4px 0px 0px #14532d', imageRendering: 'pixelated'}}>
    {children}
  </button>
);

export const ArcadeButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-gradient-to-b from-pink-500 to-pink-700 text-white font-bold text-sm rounded-sm border-4 border-yellow-400 hover:from-pink-600 hover:to-pink-800 transition-all ${className}`}>
    {children}
  </button>
);

export const EightiesNeonButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-black text-cyan-400 font-bold text-sm tracking-widest uppercase border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black transition-all ${className}`} style={{textShadow: '0 0 10px #22d3ee', boxShadow: '0 0 10px #22d3ee, inset 0 0 10px #22d3ee'}}>
    {children}
  </button>
);

export const VHSButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-slate-900 text-white font-mono text-sm tracking-tighter border-y-4 border-blue-600 hover:bg-slate-800 transition-all ${className}`}>
    {children}
  </button>
);

export const CassetteButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-stone-700 text-white font-bold text-sm rounded-sm border-4 border-stone-500 hover:bg-stone-600 transition-all ${className}`}>
    {children}
  </button>
);

export const FloppyButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-blue-800 text-white font-bold text-sm rounded-sm border-4 border-blue-600 hover:bg-blue-700 transition-all ${className}`}>
    {children}
  </button>
);

export const OldComputerButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-7 py-3 bg-amber-700 text-amber-100 font-mono text-sm border-2 border-amber-900 hover:bg-amber-600 transition-all ${className}`}>
    {children}
  </button>
);

export const CRTButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-black text-green-400 font-mono text-sm border-4 border-gray-600 rounded-lg hover:text-green-300 transition-all ${className}`}>
    {children}
  </button>
);

export const PolaroidButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-6 py-4 bg-white text-slate-800 font-bold text-sm shadow-lg hover:shadow-xl transition-all ${className}`}>
    {children}
  </button>
);

export const FilmStripButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-black text-white font-bold text-sm border-x-4 border-dashed border-white hover:bg-gray-900 transition-all ${className}`}>
    {children}
  </button>
);

export const VinylButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-black text-white font-bold text-sm rounded-full border-4 border-gray-700 hover:border-gray-500 transition-all ${className}`}>
    {children}
  </button>
);

export const ComicButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-8 py-3 bg-yellow-400 text-black font-extrabold text-sm uppercase tracking-wide border-4 border-black hover:bg-yellow-300 transition-all ${className}`} style={{boxShadow: '4px 4px 0px 0px #000'}}>
    {children}
  </button>
);
