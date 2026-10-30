import React from 'react';
import { Swords, Palette, Minimize2, Maximize2, LogOut } from 'lucide-react';
import { MapTheme } from '../../../types';
import { MAP_THEMES_CONFIG } from '../../../config/mapThemesConfig';

interface ArenaScoreHeaderProps {
  isDark: boolean;
  hudBlueScore: number;
  hudRedScore: number;
  hudTimeLeft: number;
  selectedMapTheme: MapTheme;
  hudActiveSkill: { type: string; label: string; timeLeft: number } | null;
  hudMyHp: number;
  hudMyKills: number;
  setShowCustomizerModal: (show: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  inLobby: boolean;
  handleLeaveMatch: () => void;
}

export const ArenaScoreHeader: React.FC<ArenaScoreHeaderProps> = ({
  isDark,
  hudBlueScore,
  hudRedScore,
  hudTimeLeft,
  selectedMapTheme,
  hudActiveSkill,
  hudMyHp,
  hudMyKills,
  setShowCustomizerModal,
  isFullscreen,
  toggleFullscreen,
  inLobby,
  handleLeaveMatch,
}) => {
  if (inLobby) return null;

  return (
    <div
      className={`${
        isDark
          ? 'bg-slate-900 border-slate-800 text-white shadow-2xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-lg'
      } border-2 rounded-xl md:rounded-2xl ${
        isFullscreen ? 'p-1.5 md:p-3' : 'p-2.5 md:p-3'
      } flex items-center justify-between gap-1.5 md:gap-4 select-none shrink-0 transition-colors duration-200`}
    >
      {/* Team Blue Score */}
      <div className="flex items-center gap-1.5 md:gap-3">
        <div
          className={`w-9 h-9 md:w-12 md:h-12 rounded-xl ${
            isDark
              ? 'bg-cyan-950 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-cyan-50 text-cyan-900 shadow-sm'
          } border-2 border-cyan-400 flex flex-col items-center justify-center font-black`}
        >
          <span className="text-[8px] md:text-[10px] uppercase font-bold text-cyan-500">
            BIRU
          </span>
          <span className="text-base md:text-xl leading-none font-mono-numbers">
            {hudBlueScore}
          </span>
        </div>
        <div className="hidden md:block">
          <span className="text-xs font-bold text-cyan-500 block">TIM CYBER BIRU</span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Kills: {hudBlueScore}
          </span>
        </div>
      </div>

      {/* Center: Match Timer, Active Skill, Customizer Button */}
      <div className="text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs font-extrabold tracking-wider uppercase text-amber-500">
          <Swords className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
          <span className="truncate max-w-[130px] md:max-w-none">
            TDM · {(MAP_THEMES_CONFIG[selectedMapTheme]?.name || 'Arena').split('(')[0]}
          </span>
        </div>

        <div
          className={`text-lg md:text-3xl font-black font-mono-numbers ${
            isDark ? 'text-white' : 'text-slate-900'
          } tracking-tight leading-tight`}
        >
          {hudTimeLeft}s
        </div>

        {/* Active Skill or Room Code */}
        {hudActiveSkill ? (
          <div
            className={`flex items-center gap-1 ${
              isDark
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-300'
                : 'bg-amber-100 border-amber-400 text-amber-800'
            } border px-2 py-0.5 rounded-full text-[9px] md:text-[11px] font-bold animate-pulse mt-0.5`}
          >
            <span>⚡ {hudActiveSkill.label}</span>
            <span className="font-mono">({hudActiveSkill.timeLeft}s)</span>
          </div>
        ) : (
          <span
            className={`text-[8px] md:text-[10px] ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            } block font-mono`}
          >
            HP:{' '}
            <strong className={hudMyHp < 30 ? 'text-rose-500' : 'text-emerald-500'}>
              {hudMyHp}%
            </strong>{' '}
            · Kills: <strong>{hudMyKills}</strong>
          </span>
        )}
      </div>

      {/* Team Red Score & Controls */}
      <div className="flex items-center gap-1.5 md:gap-3">
        <div className="hidden md:block text-right">
          <span className="text-xs font-bold text-rose-500 block">TIM PLASMA MERAH</span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Kills: {hudRedScore}
          </span>
        </div>
        <div
          className={`w-9 h-9 md:w-12 md:h-12 rounded-xl ${
            isDark
              ? 'bg-rose-950 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'bg-rose-50 text-rose-900 shadow-sm'
          } border-2 border-rose-500 flex flex-col items-center justify-center font-black`}
        >
          <span className="text-[8px] md:text-[10px] uppercase font-bold text-rose-500">
            MERAH
          </span>
          <span className="text-base md:text-xl leading-none font-mono-numbers">
            {hudRedScore}
          </span>
        </div>

        {/* Customizer Button */}
        <button
          onClick={() => setShowCustomizerModal(true)}
          className={`p-1.5 md:p-2.5 rounded-xl border transition-colors ${
            isDark
              ? 'bg-amber-500/25 border-amber-500/50 hover:bg-amber-500/35 text-amber-300'
              : 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800 shadow-xs'
          }`}
          title="Kustomisasi Karakter"
          aria-label="Kustomisasi Karakter"
        >
          <Palette className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className={`p-1.5 md:p-2.5 rounded-xl border transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'
              : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700 shadow-xs'
          }`}
          title={isFullscreen ? 'Keluar Fullscreen (F)' : 'Layar Penuh / Fullscreen (F)'}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
          ) : (
            <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>

        {/* Leave Match Button */}
        <button
          onClick={handleLeaveMatch}
          className={`px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${
            isDark
              ? 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-300'
              : 'bg-rose-100 border-rose-300 hover:bg-rose-200 text-rose-800 shadow-xs'
          }`}
          title="Tinggalkan Match"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  );
};
