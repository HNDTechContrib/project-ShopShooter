import React from 'react';
import { Crosshair, Target, Trophy, AlertTriangle, Zap, Play } from 'lucide-react';

interface ShooterWelcomeScreenProps {
  isDark: boolean;
  onStartGame: () => void;
}

export const ShooterWelcomeScreen: React.FC<ShooterWelcomeScreenProps> = ({
  isDark,
  onStartGame,
}) => {
  return (
    <div className={`absolute inset-0 z-30 ${isDark ? 'bg-slate-950/85 text-white' : 'bg-slate-50/95 text-slate-900'} backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center`}>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-xl shadow-orange-500/20">
        <Crosshair className="w-7 h-7 text-white" />
      </div>

      <h2 className={`text-2xl md:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 tracking-tight`}>
        Arena Latihan Target
      </h2>
      <p className={`text-xs md:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-lg mb-6 leading-relaxed`}>
        Tembak target diskon yang bergerak di arena. Kumpulkan poin sebanyak mungkin untuk ditukarkan menjadi potongan belanja di keranjang.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full mb-6 text-left text-xs">
        <div className={`${isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
          <span className="font-bold text-sky-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Target Reguler</span>
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+25 s/d +60 Poin per hit.</span>
        </div>
        <div className={`${isDark ? 'bg-slate-900/90 border-amber-500/30 text-slate-300' : 'bg-white border-amber-400/50 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
          <span className="font-bold text-amber-500 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Target Emas</span>
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+250 Poin! Butuh 3x hit.</span>
        </div>
        <div className={`${isDark ? 'bg-slate-900/90 border-red-500/30 text-slate-300' : 'bg-white border-red-400/50 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
          <span className="font-bold text-rose-500 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Bom Penalti</span>
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>-60 Poin jika terkena tembak.</span>
        </div>
        <div className={`${isDark ? 'bg-slate-900/90 border-emerald-500/30 text-slate-300' : 'bg-white border-emerald-400/50 text-slate-700 shadow-sm'} border p-3 rounded-xl flex flex-col gap-1`}>
          <span className="font-bold text-emerald-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Power-Up</span>
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Slow-mo, Multi-shot, & Magnet.</span>
        </div>
      </div>

      <button
        onClick={onStartGame}
        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Mulai Bermain (45 Detik)</span>
      </button>
    </div>
  );
};
