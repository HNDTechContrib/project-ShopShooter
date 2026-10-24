import React from 'react';
import { POINT_TO_RUPIAH_RATIO, formatRupiah } from '../../data/mockData';
import { Flame, VolumeX, Volume2, Play } from 'lucide-react';

interface ShooterHUDProps {
  isDark: boolean;
  roundTimeLeft: number;
  isPlaying: boolean;
  roundScore: number;
  comboCount: number;
  comboMultiplier: number;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onStartGame: () => void;
  onTogglePause: () => void;
}

export const ShooterHUD: React.FC<ShooterHUDProps> = ({
  isDark,
  roundTimeLeft,
  isPlaying,
  roundScore,
  comboCount,
  comboMultiplier,
  isMuted,
  isPaused,
  onToggleMute,
  onStartGame,
  onTogglePause,
}) => {
  return (
    <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-2xl p-4 md:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4`}>
      {/* Left: Round Timer & Status */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} font-semibold`}>Sisa Waktu</span>
          <span className={`text-3xl font-extrabold font-mono-numbers ${roundTimeLeft <= 10 && isPlaying ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
            {roundTimeLeft}s
          </span>
        </div>

        <div className={`h-10 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex flex-col">
          <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} font-semibold`}>Skor Ronde Ini</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-500 font-mono-numbers">
              +{roundScore}
            </span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              (≈ {formatRupiah(roundScore * POINT_TO_RUPIAH_RATIO)})
            </span>
          </div>
        </div>
      </div>

      {/* Center: Combo Streak Indicator */}
      <div className={`flex items-center gap-3 ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'} px-4 py-2 rounded-xl border`}>
        <Flame className={`w-5 h-5 ${comboCount > 0 ? 'text-orange-500 animate-bounce' : 'text-slate-400'}`} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium`}>Combo Streak:</span>
            <span className="font-bold text-orange-500 font-mono-numbers">{comboCount} Hits</span>
          </div>
          <span className="text-xs font-semibold text-emerald-500">
            Pengali: x{comboMultiplier.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Right: Sound & Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
        </button>

        {!isPlaying ? (
          <button
            onClick={onStartGame}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Mulai Tembak!
          </button>
        ) : (
          <button
            onClick={onTogglePause}
            className={`px-4 py-2.5 ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'} font-medium rounded-xl border text-sm transition-colors`}
          >
            {isPaused ? 'Lanjut' : 'Jeda'}
          </button>
        )}
      </div>
    </div>
  );
};
