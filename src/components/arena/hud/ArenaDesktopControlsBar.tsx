import React from 'react';

interface ArenaDesktopControlsBarProps {
  isDark: boolean;
  showVirtualControls: boolean;
  matchStatus: 'lobby' | 'playing' | 'ended';
  respawnTimer: number;
}

export const ArenaDesktopControlsBar: React.FC<ArenaDesktopControlsBarProps> = ({
  isDark,
  showVirtualControls,
  matchStatus,
  respawnTimer,
}) => {
  if (showVirtualControls || matchStatus !== 'playing' || respawnTimer > 0) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none max-w-[95%]">
      <div
        className={`flex items-center flex-wrap justify-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] md:text-xs font-semibold shadow-lg border transition-all ${
          isDark
            ? 'bg-slate-950/85 border-slate-700/60 text-slate-300 shadow-black/40'
            : 'bg-white/95 border-slate-200/90 text-slate-700 shadow-slate-300/40'
        }`}
      >
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">
            W A S D
          </kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">
            Panah
          </kbd>
          <span className="text-slate-400">Gerak</span>
        </span>
        <span className="text-slate-500">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">
            Klik Kiri
          </kbd>
          <span className="text-slate-400">Bidik &amp; Tembak</span>
        </span>
        <span className="text-slate-500">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[9px] md:text-[10px] font-bold border border-slate-600">
            Spasi / Shift
          </kbd>
          <span className="text-slate-400">Dash</span>
        </span>
      </div>
    </div>
  );
};
